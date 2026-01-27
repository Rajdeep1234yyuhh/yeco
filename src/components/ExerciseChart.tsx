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
        borderColor: "#3B82F6", // Changed to blue for professional look
        backgroundColor: graphData.map(
          (entry) =>
            entry.improvementCheck
              ? entry.improvementResult === "Mood Improved ✅"
                ? "#22C55E" // Success green
                : "#EF4444" // Error red
              : entry.exercise
              ? "#8B5CF6" // Purple for exercises
              : "#93C5FD" // Light blue
        ),
        pointBackgroundColor: graphData.map((entry) =>
          entry.improvementCheck
            ? entry.improvementResult === "Mood Improved ✅"
              ? "#22C55E"
              : "#EF4444"
            : entry.exercise
            ? "#8B5CF6"
            : "#3B82F6"
        ),
        pointBorderColor: "#1E40AF", // Darker blue for border
        pointRadius: graphData.map((entry) =>
          entry.improvementCheck ? 10 : entry.exercise ? 8 : 6
        ),
        pointStyle: graphData.map((entry) =>
          entry.improvementCheck
            ? "triangle"
            : entry.exercise
            ? "rect"
            : "circle"
        ),
        pointHoverRadius: graphData.map((entry) =>
          entry.improvementCheck ? 12 : entry.exercise ? 10 : 8
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
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        min: -10,
        max: 10,
        ticks: {
          stepSize: 2,
          color: "#94A3B8", // Lighter color for dark theme
        },
        grid: {
          color: "rgba(148, 163, 184, 0.15)", // Subtle grid lines for dark theme
        },
      },
      x: {
        ticks: {
          color: "#94A3B8", // Lighter color for dark theme
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)", // Very subtle grid lines for x-axis
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(30, 41, 59, 0.9)", // Darker blue background for tooltip
        titleColor: "#F8FAFC", // Light text
        bodyColor: "#F1F5F9", // Light text
        padding: 12,
        cornerRadius: 6,
        boxPadding: 6,
        bodyFont: {
          size: 13,
        },
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

            if (improvementResult) {
              label += `, ${improvementResult}`;
            }

            if (exercise) {
              label += `, Exercise: ${exercise}`;
            }

            if (
              emotion &&
              ![
                "exercise_suggestion",
                "improvement_check",
                "retry_exercise",
              ].includes(emotion)
            ) {
              label += `, Emotion: ${emotion}`;
            }

            return label;
          },
        },
      },
      legend: {
        labels: {
          color: "#E2E8F0", // Light text color for dark theme
          font: {
            weight: "bold" as const, // Medium font weight
          },
          boxWidth: 20,
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mt-8 bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h3 className="text-lg font-medium text-slate-200 mb-4">
        Mood Progress Chart
      </h3>
      <div className="bg-slate-900 p-5 rounded-md border border-slate-700 shadow-md">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 rounded-full bg-blue-500"></span>
          Regular entry
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 rounded-md bg-purple-500"></span>
          Exercise performed
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-0 h-0 mr-2 border-solid border-4 border-transparent border-b-4 border-b-green-500"
            style={{ width: "0", height: "0" }}
          ></span>
          Improvement (positive)
        </div>
        <div className="flex items-center">
          <span
            className="inline-block w-0 h-0 mr-2 border-solid border-4 border-transparent border-b-4 border-b-red-500"
            style={{ width: "0", height: "0" }}
          ></span>
          Improvement (negative)
        </div>
      </div>
    </div>
  );
};

export default ExerciseChart;
