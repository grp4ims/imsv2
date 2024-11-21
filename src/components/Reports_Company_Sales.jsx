import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register the required Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const ReportsCompanySales = ({ token }) => {
  const [salesData, setSalesData] = useState([]);
  const [companyWithMostRevenue, setCompanyWithMostRevenue] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/reports/companies-sales`,
          {
            headers: { Authorization: `Bearer ${token}` },
            //   params: { company: selectedCompany },
          }
        );
        setSalesData(response.data);
        const companyWithMostRevenue = response.data.reduce((max, company) => {
          return max.Total_Sales > company.Total_Sales ? max : company;
        });
        setCompanyWithMostRevenue(companyWithMostRevenue);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, [token]);

  const chartData = {
    labels: salesData.map((item) => item.Company_Name),
    datasets: [
      {
        label: "Total Sales",
        data: salesData.map((item) => item.Total_Sales),
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Light green
        borderColor: "rgba(75, 192, 192, 1)", // Dark green
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Individual Company Sales",
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div
      className="chart-container"
      style={{
        display: "block",
        boxSizing: "border-box",
        height: "400px",
        width: "800px",
        paddingBottom: "20px",
      }}
    >
      {companyWithMostRevenue && (
        <h3 className="text-center mb-4">
          <span style={{ fontWeight: "bold" }}>
            {companyWithMostRevenue.Company_Name}
          </span>{" "}
          spent the most of ${""}
          <span style={{ fontWeight: "bold" }}>
            {companyWithMostRevenue.Total_Sales}
          </span>
        </h3>
      )}
      {salesData.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p>No sales data available</p>
      )}
    </div>
  );
};

export default ReportsCompanySales;
