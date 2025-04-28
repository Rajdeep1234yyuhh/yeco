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
        borderColor: "#10B981", // Line color
        backgroundColor: graphData.map(
          (entry) =>
            entry.emotion === "exercise_suggestion" ? "#FBBF24" : "#6EE7B7" // Yellow for exercise
        ),
        pointBackgroundColor: graphData.map(
          (entry) =>
            entry.emotion === "exercise_suggestion" ? "#FBBF24" : "#10B981" // Yellow for exercise
        ),
        pointBorderColor: graphData.map(
          (entry) =>
            entry.emotion === "exercise_suggestion" ? "#F59E0B" : "#10B981" // Slightly dark yellow
        ),
        pointRadius: graphData.map(
          (entry) => (entry.emotion === "exercise_suggestion" ? 10 : 6) // Bigger if exercise
        ),
        pointStyle: graphData.map((entry) =>
          entry.emotion === "exercise_suggestion" ? "star" : "circle"
        ),
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: -10,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const dataIndex = context.dataIndex;
            const dataset = context.dataset;
            const score = context.parsed.y;
            const emotion = dataset.emotions?.[dataIndex];
            const exercise = dataset.exercises?.[dataIndex];

            let label = `Score: ${score}`;
            if (emotion && emotion !== "exercise_suggestion") {
              label += `, Emotion: ${emotion}`;
            }
            if (exercise) {
              label += `, Exercise: ${exercise}`;
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
