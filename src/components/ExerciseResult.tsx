type ExerciseResultProps = {
  suggestion: string;
};

const ExerciseResult = ({ suggestion }: ExerciseResultProps) =>
  suggestion ? (
    <div className="mt-8 bg-white text-black rounded-lg p-6 shadow-lg max-w-md text-center">
      <p className="text-lg font-medium">{suggestion}</p>
    </div>
  ) : null;

export default ExerciseResult;
