// src/App.tsx
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    fetch('/api/time').then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      setTime(data.time);
    }).catch(err => console.error('Erro ao buscar dados:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>O horário atual é: {time}</p>
      </header>
    </div>
  );
}

export default App;