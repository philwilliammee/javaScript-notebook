import React, { useState } from 'react';
import { PlusCircle, BookOpen } from 'lucide-react';
import { CodeCell } from './CodeCell';

export function Notebook() {
  const [cells, setCells] = useState<string[]>(['1']);

  const addCell = () => {
    setCells(prev => [...prev, (prev.length + 1).toString()]);
  };

  const deleteCell = (id: string) => {
    setCells(prev => prev.filter(cellId => cellId !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">JavaScript Notebook</h1>
        </div>
        <button
          onClick={addCell}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          <PlusCircle size={20} />
          Add Cell
        </button>
      </div>
      
      <div className="space-y-6">
        {cells.map((id) => (
          <CodeCell key={id} id={id} onDelete={deleteCell} />
        ))}
      </div>
    </div>
  );
}