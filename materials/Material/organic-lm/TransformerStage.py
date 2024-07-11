import torch
import torch.nn as nn
import torch.optim as optim

class DynamicEmbedding(nn.Module):
    def __init__(self, embedding_dim=64):
        super(DynamicEmbedding, self).__init__()
        self.embedding_dim = embedding_dim
        self.embeddings = nn.Embedding(256 * 2, embedding_dim)  # Assuming 256 ASCII values + position info
        self.dictionary = {}

    def forward(self, ascii_value, position):
        encoding = (ascii_value << 1) | position  # Combine ASCII value with position bit
        if encoding not in self.dictionary:
            self.dictionary[encoding] = len(self.dictionary)
        index = torch.tensor([self.dictionary[encoding]], dtype=torch.long)
        return self.embeddings(index)

class TransformerStage(nn.Module):
    def __init__(self, embedding_dim=64):
        super(TransformerStage, self).__init__()
        self.transformer = nn.Transformer(d_model=embedding_dim, nhead=8, num_encoder_layers=3)
        self.fc = nn.Linear(embedding_dim, embedding_dim)  # FFN

    def forward(self, x):
        x = self.transformer(x)
        output = self.fc(x.mean(dim=1))  # Example output
        return output

class MultiStageModel(nn.Module):
    def __init__(self, embedding_dim=64):
        super(MultiStageModel, self).__init__()
        self.embedding_layer = DynamicEmbedding(embedding_dim)
        self.stage1 = TransformerStage(embedding_dim)
        self.stage2 = TransformerStage(embedding_dim)
        self.stage3 = TransformerStage(embedding_dim)

    def forward(self, ascii_values, positions):
        embeddings = [self.embedding_layer(ascii, pos) for ascii, pos in zip(ascii_values, positions)]
        embeddings = torch.stack(embeddings).squeeze(1)
        output1 = self.stage1(embeddings)
        output2 = self.stage2(output1)
        output3 = self.stage3(output2)
        return output1, output2, output3

# Example usage
embedding_dim = 64
model = MultiStageModel(embedding_dim)
criterion = nn.MSELoss()  # Using MSE loss for simplicity
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Dummy input (ascii values and positions)
ascii_values = [ord('a'), ord('b'), ord('c')]
positions = [0, 1, 2]  # Example positions

# Forward pass
output1, output2, output3 = model(ascii_values, positions)

# Dummy target embeddings
target_embedding = torch.randn(embedding_dim)

# Calculate losses (assuming the same target for simplicity)
loss1 = criterion(output1, target_embedding)
loss2 = criterion(output2, target_embedding)
loss3 = criterion(output3, target_embedding)

# Combine losses
total_loss = loss1 + loss2 + loss3

# Backward pass
optimizer.zero_grad()
total_loss.backward()
optimizer.step()
