import React, { useRef, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register necessary controllers and elements
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
);

const Chart = ({ transactions }) => {
  // Process transactions to get categories and amounts
  const categories = transactions.reduce((acc, transaction) => {
    acc[transaction.category] = acc[transaction.category]
      ? acc[transaction.category] + transaction.amount
      : transaction.amount;
    return acc;
  }, {});

  // Data for Pie chart
  const pieData = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: ['#006400', // Solid, opaque color for Expenses
          '#003366'],
      }
    ]
  };

  // Data for Bar chart
  const barData = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Expenses',
        borderWidth: 1,
        data: Object.values(categories),
        backgroundColor: [     'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 
            'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 
            'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 
            'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 
            'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 
            'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 
            'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)' 
        ],
       
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom aspect ratio
  };

  return (
    <div>
      <div className="chart-container pie-chart-container">
        <Pie data={pieData} options={options} />
      </div>
      <div className="chart-container bar-chart-container">
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
};

export default Chart;
