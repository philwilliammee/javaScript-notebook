import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface CodeCellProps {
  id: string;
  onDelete: (id: string) => void;
}

export function CodeCell({ id, onDelete }: CodeCellProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const executeCode = () => {
    try {
      // Create a new function to execute the code and capture its return value
      const result = new Function(`
        try {
          return (function() { 
            ${code}
          })();
        } catch (error) {
          return error.toString();
        }
      `)();
      
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">Cell #{id}</span>
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>
      <div className="mb-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-32 p-2 font-mono text-sm bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your JavaScript code here..."
        />
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={executeCode}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <Play size={16} />
          Execute
        </button>
      </div>
      {output && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-gray-700 mb-1">Output:</div>
          <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}