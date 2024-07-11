import tensorflow as tf

# Parameters
vocab_size = 128  # Number of unique tokens (e.g., ASCII characters)
embedding_dim = 64  # Size of the embedding vectors
input_length = 10  # Length of input sequences

# Define the Embedding layer
embedding_layer = tf.keras.layers.Embedding(input_dim=vocab_size, output_dim=embedding_dim, input_length=input_length)

# Define the model
model = tf.keras.Sequential([
    embedding_layer,
    tf.keras.layers.LSTM(128, return_sequences=True),  # LSTM layer that returns a sequence
    tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(vocab_size, activation='softmax'))  # Apply Dense to each time step
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Example input: batch of sequences (batch_size=2, sequence_length=10)
input_data = tf.constant([
    [65, 66, 67, 68, 69, 70, 71, 72, 73, 74],  # Sequence of token indices
    [75, 76, 77, 78, 79, 80, 81, 82, 83, 84]
])

# Example targets: same shape as input for simplicity
targets = tf.constant([
    [65, 66, 67, 68, 69, 70, 71, 72, 73, 74],  # Sequence of token indices
    [75, 76, 77, 78, 79, 80, 81, 82, 83, 84]
])

# Train the model
model.fit(input_data, targets, epochs=10)

# Check model summary
model.summary()
