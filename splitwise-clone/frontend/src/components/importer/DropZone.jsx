import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2 } from 'lucide-react';
import api from '../../api/client';

export default function DropZone({ onUpload, isLoading }) {
  const [file, setFile] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch groups
    api.get('/groups/')
      .then(res => setGroups(res.data))
      .catch(err => console.error("Failed to fetch groups", err));
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      alert("Please drop a valid .csv file.");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file && groupId) {
      onUpload(file, groupId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Import Expenses via CSV</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Group for Import</label>
        <select 
          value={groupId} 
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Choose a group --</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv" 
          onChange={handleFileSelect} 
        />
        
        {file ? (
          <>
            <FileSpreadsheet className="w-12 h-12 text-indigo-500 mb-3" />
            <p className="text-slate-800 font-medium">{file.name}</p>
            <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium mb-1">Click to browse or drag and drop</p>
            <p className="text-slate-400 text-sm">Only .csv files are supported</p>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || !groupId || isLoading}
          className={`flex items-center px-6 py-2.5 rounded-lg font-medium text-white transition-colors
            ${(!file || !groupId || isLoading) ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate CSV'
          )}
        </button>
      </div>
    </div>
  );
}
