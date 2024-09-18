import React from 'react';
import './App.css';
import FuzzySearch from './components/FuzzySearch';

function App() {
  const handleDownload = (selectedPath) => {
    // TODO: Implement API call with selectedPath
    console.log(`Downloading: ${selectedPath}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fuzzy File Search</h1>
        <FuzzySearch onDownload={handleDownload} />
      </header>
    </div>
  );
}

export default App;
