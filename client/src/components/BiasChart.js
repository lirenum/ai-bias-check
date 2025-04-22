// client/src/components/BiasChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function BiasChart({ biasIndex }) {
  if (!biasIndex) return null;

  const data = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        label: 'Sentiment %',
        data: [
          biasIndex.positive,
          biasIndex.negative,
          biasIndex.neutral,
        ],
        backgroundColor: ['#4CAF50', '#F44336', '#9E9E9E'],
        borderRadius: 5,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: {
          callback: (val) => `${val}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Bias Index Summary</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export default BiasChart;
