import React from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Define the type for individual chart data entries
type ChartDataItem = {
  dataTitle: string;
  dataValue: number;
};

// Define the props for the component
interface FeedbackIssuesChartProps {
  chartData: ChartDataItem[];
  gradient?: boolean; // Optional: If gradient is to be applied
  issuesWord?: boolean; // Optional: If 'issues' word should be appended
  title?: string; // Optional: Title of the chart
}

const FeedbackIssuesChart: React.FC<FeedbackIssuesChartProps> = ({
  chartData,
  gradient = false,
  issuesWord = false,
  title = "Chart",
}) => {
  // Initialize variables
  const labels: string[] = [];
  const newData: number[] = [];
  const color: string[] = [];
  let opa = 1;

  if (chartData && chartData.length > 0) {
    chartData.forEach((value) => {
      // Generate labels
      const label = issuesWord ? `${value.dataTitle} issues` : value.dataTitle;
      labels.push(label);

      // Push data
      newData.push(value.dataValue);

      // Generate color (gradient or solid)
      opa -= 0.1;
      if (gradient) {
        color.push(`rgba(255,0,0,${opa})`);
      } else {
        color.push(`rgba(255, 255, 0, 0.9)`);
      }
    });
  } else {
    console.error("Invalid chart data:", chartData);
    throw new Error("Analyze products: Chart data is required.");
  }

  // Dataset for Chart.js
  const data = {
    labels: labels.length > 0 ? labels : ["Not defined"],
    datasets: [
      {
        label: "Number of products",
        data: newData,
        backgroundColor: color.length > 0 ? color : "#FFFFFF",
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default FeedbackIssuesChart;
