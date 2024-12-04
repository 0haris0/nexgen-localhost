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

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const FeedbackIssuesChart = (props) => {
  const { chartData, gradient, issuesWord } = props;
  let labels = [];
  let newData = [];
  let dataSet = [];
  let color = [];
  let opa = 1;
  if (chartData && chartData.length > 0) {
    chartData.map((value) => {
      if (issuesWord) {
        labels.push([value.dataTitle + " issues"]);
      } else {
        labels.push([value.dataTitle]);
      }
      newData.push(value.dataValue);
      opa = opa - 0.1;
      if (gradient) {
        color.push(`rgba(255,0,0,${opa})`);
      } else {
        color.push(`rgba(255,255,0,0.9})`);
      }
    });
    dataSet.push({
      label: "Number of products",
      data: newData,
      backgroundColor: color || "#FFFFFF",
    });
  } else {
    console.error(chartData);
    throw new Error("Analyze products");
  }
  // Example data for number of issues and product count
  const data = {
    labels: labels || ["Not defined"], // X-axis labels for feedback issues
    datasets: dataSet,
  };

  // Configuration for the chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: props.title,
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
