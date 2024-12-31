'use client';

import React, { useState } from 'react';

interface SingleSelectProps {
  options: string[];
  selectedOption: string;
  onChange: (selected: string) => void;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  options,
  selectedOption,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer text-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption : 'Select a stat'}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedOption === option ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSelectOption(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleSelect;
