import React from 'react';

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
    <button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Download File
    </button>
  );
};

export default DownloadButton;