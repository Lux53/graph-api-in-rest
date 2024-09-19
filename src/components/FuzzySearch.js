import React, { useState, useEffect, useMemo } from 'react';
import { Fzf } from 'fzf';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml_lang from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import json_lang from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import yaml from 'js-yaml';
import './FuzzySearch.css';

SyntaxHighlighter.registerLanguage('yaml', yaml_lang);
SyntaxHighlighter.registerLanguage('json', json_lang);

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Replace with your actual API base URL

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

const FuzzySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [apiResponse, setApiResponse] = useState('');
  const [responseFormat, setResponseFormat] = useState('text');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (!selectedItems.includes(path)) {
      setSelectedItems([...selectedItems, path]);
    }
  };

  const handleDelete = (path) => {
    setSelectedItems(selectedItems.filter(item => item !== path));
  };

  const handleBatchRequest = async () => {
    if (selectedItems.length === 0) {
      setError('No items selected. Please select at least one item.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // const encodedItems = selectedItems.map(item => btoa(item));
    const url = `${API_BASE_URL}/batch`;
    console.log(`API call to: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: selectedItems }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      const data = await response.text();
      
      // Try to parse as YAML
      try {
        const yamlData = yaml.load(data);
        setApiResponse(yaml.dump(yamlData));
        setResponseFormat('yaml');
      } catch (e) {
        // If parsing as YAML fails, try JSON
        try {
          const jsonData = JSON.parse(data);
          setApiResponse(JSON.stringify(jsonData, null, 2));
          setResponseFormat('json');
        } catch (e) {
          // If parsing as JSON also fails, treat as plain text
          setApiResponse(data);
          setResponseFormat('text');
        }
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      setError(`Failed to fetch API response: ${e.message}`);
      setApiResponse('');
      setResponseFormat('text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiResponse).then(() => {
      alert('Response copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const DownloadButton = ({ fileContent, fileName, fileType }) => {
    const handleDownload = () => {
      // Create a Blob with the file content
      const blob = new Blob([fileContent], { type: fileType });
      
      // Create a temporary URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Programmatically click the link to trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  
    return (
      <button onClick={handleDownload} className="copy-button">
        Download File
      </button>
    );
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
      {selectedItems.length > 0 && (
        <div className="selected-items">
          <h6>Selected Items:</h6>
          <ul>
            {selectedItems.map((item, index) => (
              <li key={index}>
                {item}
                <button onClick={() => handleDelete(item)} className="delete-button">
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button onClick={handleBatchRequest} className="batch-request-button">
            Convert 
          </button>
        </div>
      )}
      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {apiResponse && (
        <div className="api-response">
          <div className="api-response-header">
            <h6>Rest API Response</h6>
            <div>
              <DownloadButton 
              fileContent={apiResponse}
              fileName="APIDefinition.yaml"
              fileType="yaml"
              />
              <button onClick={handleCopy} className="copy-button">Copy</button>
            </div>
          </div>
          <SyntaxHighlighter language={responseFormat === 'json' ? 'json' : 'yaml'} style={docco}>
            {apiResponse}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default FuzzySearch;