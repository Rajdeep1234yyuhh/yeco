import React from "react";

type ExerciseResultProps = {
  suggestion: string;
};

const ExerciseResult: React.FC<ExerciseResultProps> = ({ suggestion }) => {
  if (!suggestion) return null;

  return (
    <div className="mt-4 bg-gray-800/80 rounded-md p-3 shadow-sm max-w-md mx-auto transition-all">
      <div className="border-l-3 border-green-500 pl-3 flex items-center justify-between gap-2">
        <p className="text-sm text-gray-100">{suggestion}</p>
        <span className="text-xs text-green-400 whitespace-nowrap">
          Suggestion
        </span>
      </div>
    </div>
  );
};

export default ExerciseResult;
