import React from "react";

type ExerciseButtonProps = {
  onClick: () => void;
  children?: React.ReactNode;
};

const ExerciseButton = ({
  onClick,
  children = "Generate Suggestion",
}: ExerciseButtonProps) => (
  <button
    onClick={onClick}
    className="bg-gray-800 hover:bg-gray-700 text-green-400 font-semibold py-2 px-6 rounded-lg transition-all border border-green-500"
    type="button"
  >
    {children}
  </button>
);

export default ExerciseButton;
