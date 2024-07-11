import React, { useState, useEffect, useCallback } from 'react';
import { FilePicker } from 'react-file-picker';

const TypingGame = () => {
  const [currentSnippet, setCurrentSnippet] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [position, setPosition] = useState(0);
  const [upSpeed, setUpSpeed] = useState(1);
  const [downSpeed, setDownSpeed] = useState(1);
  const [snippets, setSnippets] = useState([]);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const getRandomSnippet = (snippets) => {
    if (snippets.length === 0) return '';
    var snippet = "";
    while (snippet.length < 1) {
      const randomIndex = Math.floor(Math.random() * snippets.length);
      snippet = snippets[randomIndex];
      // strip leading and trailing whitespace
      snippet = snippet.trim();
    }
    return snippet;
  };

  const resetGame = useCallback(() => {
    if (snippets.length > 0) {
      setCurrentSnippet(getRandomSnippet(snippets));
      setUserInput('');
      setScore(0);
      setGameOver(false);
      setPosition(0);
      setGameStarted(true);
    } else {
      console.log('No snippets to load');
    }
  }, [snippets]);

  useEffect(() => {
    const lastFileContent = localStorage.getItem('lastFileContent');
    if (lastFileContent) {
      const loadedSnippets = lastFileContent.split('\n').filter(Boolean);
      setSnippets(loadedSnippets);
      setIsFileLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        setPosition((prevPosition) => {
          if (prevPosition >= 90) {
            setGameOver(true);
            return prevPosition;
          }
          return prevPosition + upSpeed;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, upSpeed]);

  const handleInputChange = (e) => {
    const input = e.target.value.trim().toLowerCase();
    setUserInput(e.target.value); // Keep the original input for display purposes
  
    if (input === currentSnippet.slice(0, input.length).trim().toLowerCase()) {
      let pos = position - downSpeed;
      if (pos < 0) {
        pos = 0;
        setScore((prevScore) => prevScore + 10);
      } else {
        setScore((prevScore) => prevScore + 1);
      }
      setPosition(pos);
    }
  
    if (input === currentSnippet.trim().toLowerCase()) {
      setScore((prevScore) => prevScore + 10);
      setCurrentSnippet(getRandomSnippet(snippets));
      setUserInput('');
      setPosition(0);
    }
  };
  
  const getHighlightedSnippet = () => {
    return (
      <div>
        {currentSnippet.split('').map((char, index) => {
          const isCorrect = userInput[index] && userInput[index].toLowerCase() === char.toLowerCase();
          return (
            <span key={index} style={{ color: isCorrect ? '#FFFF00' : '#FFFFFF' }}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  const handleFileChange = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const newSnippets = e.target.result.split('\n').filter(Boolean);
      setSnippets(newSnippets);
      localStorage.setItem('lastFileContent', e.target.result);
      setIsFileLoaded(true);

      if (newSnippets.length > 0) {
        resetGame();
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#1a202c', color: '#FFFFFF', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Typing Game</h1>
      <div style={{ position: 'relative', width: '100%', maxWidth: '42rem', height: '38rem', border: '2px solid #4a5568', overflow: 'hidden', marginBottom: '1rem' }}>
        {gameStarted && !gameOver && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#2d3748',
              fontSize: '1.125rem',
              top: `${position}%`,
              textAlign: 'left',
              minHeight: '100vh',
            }}
          >
            {getHighlightedSnippet()}
          </div>
        )}
      </div>
      {!isFileLoaded && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#4a5568', borderRadius: '0.25rem' }}>
          Please select a file to load game snippets.
        </div>
      )}
      {isFileLoaded && !gameStarted && (
        <button
          onClick={resetGame}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4299e1',
            color: '#FFFFFF',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Start Game
        </button>
      )}
      {gameStarted && !gameOver ? (
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          style={{
            width: '100%',
            maxWidth: '42rem',
            padding: '0.5rem',
            fontSize: '1.125rem',
            backgroundColor: '#2d3748',
            border: '2px solid #4a5568',
            color: '#FFFFFF',
            outline: 'none'
          }}
          placeholder="Type the snippet..."
          autoFocus
        />
      ) : gameOver && (
        <button
          onClick={resetGame}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4299e1',
            color: '#FFFFFF',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Play Again
        </button>
      )}
      <div style={{ marginTop: '1rem', fontSize: '1.25rem' }}>Score: {score}</div>
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '0.5rem' }}>Up Speed:</label>
        <input
          type="number"
          value={upSpeed}
          onChange={(e) => setUpSpeed(Number(e.target.value))}
          style={{
            width: '5rem',
            padding: '0.5rem',
            backgroundColor: '#2d3748',
            border: '2px solid #4a5568',
            color: '#FFFFFF'
          }}
        />
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '0.5rem' }}>Down Speed:</label>
        <input
          type="number"
          value={downSpeed}
          onChange={(e) => setDownSpeed(Number(e.target.value))}
          style={{
            width: '5rem',
            padding: '0.5rem',
            backgroundColor: '#2d3748',
            border: '2px solid #4a5568',
            color: '#FFFFFF'
          }}
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <FilePicker
          onChange={handleFileChange}
          onError={(errMsg) => console.error(errMsg)}
        >
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4299e1',
              color: '#FFFFFF',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Select File
          </button>
        </FilePicker>
      </div>
    </div>
  );
};

export default TypingGame;
