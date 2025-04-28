type ExerciseButtonProps = {
  onClick: () => void;
};

const ExerciseButton = ({ onClick }: ExerciseButtonProps) => (
  <button
    onClick={onClick}
    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
  >
    Generate Suggestion
  </button>
);

export default ExerciseButton;
