import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

type GraphData = {
  date: string;
  score: number;
  emotion?: string;
  exercise?: string;
  improvementResult?: string;
  improvementCheck?: boolean;
};

type ExerciseChartProps = {
  graphData: GraphData[];
};

const ExerciseChart = ({ graphData }: ExerciseChartProps) => {
  const chartData = {
    labels: graphData.map((entry) => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: "Mood Score",
        data: graphData.map((entry) => entry.score),
        borderColor: "#10B981",
        backgroundColor: graphData.map((entry) =>
          entry.improvementCheck
            ? entry.improvementResult === "Mood Improved ✅"
              ? "#22C55E"
              : "#EF4444"
            : entry.exercise
            ? "#F97316"
            : "#6EE7B7"
        ),
        pointBackgroundColor: graphData.map((entry) =>
          entry.improvementCheck
            ? entry.improvementResult === "Mood Improved ✅"
              ? "#22C55E"
              : "#EF4444"
            : entry.exercise
            ? "#F97316"
            : "#10B981"
        ),
        pointBorderColor: "#10B981",
        pointRadius: graphData.map((entry) =>
          entry.improvementCheck ? 10 : entry.exercise ? 8 : 6
        ),
        pointStyle: graphData.map((entry) =>
          entry.improvementCheck
            ? "triangle"
            : entry.exercise
            ? "rectRounded"
            : "circle"
        ),
        fill: false,
        tension: 0.4,
        emotions: graphData.map((entry) => entry.emotion || ""),
        exercises: graphData.map((entry) => entry.exercise || ""),
        improvementResults: graphData.map(
          (entry) => entry.improvementResult || ""
        ),
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: -10,
        max: 10,
        ticks: { stepSize: 2 },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const dataIndex = context.dataIndex;
            const dataset = context.dataset;
            const score = context.parsed.y;
            const emotion = dataset.emotions?.[dataIndex];
            const exercise = dataset.exercises?.[dataIndex];
            const improvementResult = dataset.improvementResults?.[dataIndex];

            let label = `Score: ${score}`;
            if (emotion === "exercise_suggestion" && exercise) {
              label += `, Exercise: ${exercise}`;
            }
            if (emotion === "improvement_check" && improvementResult) {
              label += `, ${improvementResult}`;
            }
            if (
              emotion &&
              emotion !== "exercise_suggestion" &&
              emotion !== "improvement_check"
            ) {
              label += `, Emotion: ${emotion}`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mt-12 bg-white p-6 rounded-xl shadow-lg">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ExerciseChart;
