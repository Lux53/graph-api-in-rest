import React, { useState, useEffect, useMemo } from 'react';
import { Fzf } from 'fzf';
import './FuzzySearch.css';

// Extended mock list of file paths
const mockFilePaths = [
  '/home/user/documents/report.pdf',
  '/home/user/downloads/image.jpg',
  '/home/user/projects/react-app/src/App.js',
  '/home/user/music/favorite-song.mp3',
  '/home/user/videos/vacation.mp4',
  '/home/user/documents/resume.docx',
  '/home/user/projects/python-script.py',
  '/home/user/downloads/ebook.epub',
  '/home/user/pictures/family-photo.png',
  '/home/user/documents/notes.txt',
  '/home/user/projects/css/styles.css',
  '/home/user/downloads/software-installer.exe',
  '/home/user/documents/meeting-minutes.docx',
  '/home/user/projects/node-api/server.js',
  '/home/user/music/playlist.m3u',
  '/home/user/videos/tutorial.mp4',
  '/home/user/documents/budget.xlsx',
  '/home/user/projects/react-native-app/App.tsx',
  '/home/user/downloads/dataset.csv',
  '/home/user/pictures/screenshot.png',
  '/home/user/documents/presentation.pptx',
  '/home/user/projects/django-app/manage.py',
  '/home/user/music/album-cover.jpg',
  '/home/user/videos/family-reunion.mov',
  '/home/user/documents/contract.pdf',
  '/home/user/projects/vue-app/main.js',
  '/home/user/downloads/firmware-update.bin',
  '/home/user/pictures/profile-pic.jpg',
  '/home/user/documents/recipe.txt',
  '/home/user/projects/flutter-app/main.dart',
];

const HighlightChars = (props) => {
  const chars = props.str.split("");

  const nodes = chars.map((char, i) => {
    if (props.indices.has(i)) {
      return <b key={i}>{char}</b>;
    } else {
      return char;
    }
  });

  return <>{nodes}</>;
};

const FuzzySearch = ({ onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPath, setSelectedPath] = useState('');

  // Create a memoized instance of Fzf
  const fzf = useMemo(() => new Fzf(mockFilePaths), []);

  useEffect(() => {
    if (searchTerm === '') {
      setSearchResults([]);
      return;
    }

    const results = fzf.find(searchTerm);
    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  }, [searchTerm, fzf]);

  const truncatePath = (path) => {
    return path.length > 200 ? path.substring(0, 197) + '...' : path;
  };

  const handleSelect = (path) => {
    setSelectedPath(path);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="fuzzy-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a file..."
        className="search-input"
      />
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((result, index) => (
            <li key={index} onClick={() => handleSelect(result.item)}>
              <HighlightChars
                str={truncatePath(result.item)}
                indices={new Set(result.positions)}
              />
            </li>
          ))}
        </ul>
      )}
      {selectedPath && (
        <div className="selected-path">
          <p>Selected: {selectedPath}</p>
          <button onClick={() => onDownload(selectedPath)} className="download-button">
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default FuzzySearch;