import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import FilterElement from "./Reports_Filtering";
import ReportsIndividualProducts from "./Reports_IndividualProducts";
import { useNavigate } from "react-router-dom";
import CompanyDropdown from "./Reports_Company_Dropdown";
import ReportsCompanyHistory from "./Reports_Company_History";
import ReportsCompanySales from "./Reports_Company_Sales";

ChartJS.register(ArcElement, Tooltip, Legend);

const ReturnReports = () => {
  /*
  useState -> Dynamically update variables
  product -> variable name
  setProducts -> variable setter
  */
  // Jwt
  const token = localStorage.getItem("token");

  // State variables
  // Charts
  const [view, setView] = useState("SalesAndQuantityDistribution");
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartDataQty, setChartDataQty] = useState(null);
  const chartRefSales = useRef(null);
  const chartRefQty = useRef(null);

  // Navigation Purposes
  const navigate = useNavigate();

  // Dropdown list for company
  const [selectedCompany, setSelectedCompany] = useState("");

  // Filter state
  const [start, setStartDate] = useState("");
  const [end, setEndDate] = useState("");

  const getData = async () => {
    try {
      const productResponse = await axios.get(
        "http://localhost:3002/reports/prod",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Chart related stuff
      const fetchedProducts = productResponse.data;
      setProducts(fetchedProducts);
      const saleslabels = fetchedProducts.map(
        (product) => product.Product_Name
      );
      const totalSales = fetchedProducts.map((product) => product.Total_Sales);
      const salesColors = uniquecolours(fetchedProducts.length);

      setChartData({
        labels: saleslabels,
        datasets: [
          {
            label: "Total Sales",
            data: totalSales,
            backgroundColor: salesColors,
            hoverOffset: 4,
          },
        ],
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
              align: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 11,
                },
                generateLabels: (chart) =>
                  chart.data.labels.map((label, index) => {
                    const product = fetchedProducts[index];
                    return {
                      text: `${label} - Qty: ${product.Qty_Sold}`,
                      fillStyle: chart.data.datasets[0].backgroundColor[index],
                      strokeStyle:
                        chart.data.datasets[0].backgroundColor[index],
                    };
                  }),
              },
            },
          },
        },
      });

      // Prepare quantity chart data
      const qtylabels = fetchedProducts.map((product) => product.Product_Name);
      const totalQuantities = fetchedProducts.map(
        (product) => product.Qty_Sold
      );
      const qtyColors = uniquecolours(fetchedProducts.length);

      setChartDataQty({
        labels: qtylabels,
        datasets: [
          {
            label: "Total Quantity",
            data: totalQuantities,
            backgroundColor: qtyColors,
            hoverOffset: 4,
          },
        ],
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
              align: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 11,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Initial Fetching of Data
  useEffect(() => {
    getData();
  }, [token]);

  // Generate unique colors for charts
  const uniquecolours = (num) => {
    const colors = [];
    const step = 360 / num;

    for (let i = 0; i < num; i++) {
      const hue = (i * step) % 360;
      const saturation = 70 + Math.floor(Math.random() * 30);
      const lightness = 50 + Math.floor(Math.random() * 20);
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  };

  // Filtering Function
  const onFilter = async () => {
    try {
      const productResponse = await axios.get(
        "http://localhost:3002/reports/prod",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            start,
            end,
          },
        }
      );

      // This portion is the same as the top
      const fetchedProducts = productResponse.data;
      setProducts(fetchedProducts);
      const saleslabels = fetchedProducts.map(
        (product) => product.Product_Name
      );
      const totalSales = fetchedProducts.map((product) => product.Total_Sales);
      const salesColors = uniquecolours(fetchedProducts.length);

      setChartData({
        labels: saleslabels,
        datasets: [
          {
            label: "Total Sales",
            data: totalSales,
            backgroundColor: salesColors,
            hoverOffset: 4,
          },
        ],
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
              align: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 11,
                },
                generateLabels: (chart) =>
                  chart.data.labels.map((label, index) => {
                    const product = fetchedProducts[index];
                    return {
                      text: `${label} - Qty: ${product.Qty_Sold}`,
                      fillStyle: chart.data.datasets[0].backgroundColor[index],
                      strokeStyle:
                        chart.data.datasets[0].backgroundColor[index],
                    };
                  }),
              },
            },
          },
        },
      });

      const qtylabels = fetchedProducts.map((product) => product.Product_Name);
      // Remember ah, changed the the column name to Qty_Sold.
      const totalQuantities = fetchedProducts.map(
        (product) => product.Qty_Sold
      );
      const qtyColors = uniquecolours(fetchedProducts.length);

      setChartDataQty({
        labels: qtylabels,
        datasets: [
          {
            label: "Total Quantity",
            data: totalQuantities,
            backgroundColor: qtyColors,
            hoverOffset: 4,
          },
        ],
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
              align: "top",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 11,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };

  // Reset Filter

  const reset = async () => {
    setStartDate("");
    setEndDate("");

    await getData();
    // Force update to the latest data
    if (chartRefSales.current) {
      chartRefSales.current.update();
    }
    if (chartRefQty.current) {
      chartRefQty.current.update();
    }
  };

  // To generate the PDF
  const printPDF = () => {
    // style element -> this is where i can choose what to remove
    const style = document.createElement("style");
    style.innerHTML = `
    @media print {
      body {
        transform-origin: top left;
      }
      nav {
        display: none; /* Hide the navigation bar during print */
      }
      #remove-this {
        display: none; /* Hide only this specific div */
      }
    }
  `;

    // Some js thing that i need, else won't work
    document.head.appendChild(style);
    window.print();
    // reset the document
    document.head.removeChild(style);
  };

  // To update Olivia's component here
  const redirectdefect = () => {
    navigate("/defectReports");
  };

  return (
    <>
      <br />
      <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
        Reports Page
      </h2>
      <div className="divider divider-accent"></div>
      {/* Toggle Button */}
      <div id="remove-this" className="flex justify-center mb-6">
        <button
          className="btn btn-primary"
          onClick={() =>
            setView((prevView) =>
              prevView === "SalesAndQuantityDistribution"
                ? "ProductSales"
                : "SalesAndQuantityDistribution"
            )
          }
        >
          {view === "SalesAndQuantityDistribution"
            ? "View Individual Product Sales"
            : "View Sales and Quantity Distribution"}
        </button>
      </div>
      {/* Content based on view */}
      {view === "SalesAndQuantityDistribution" ? (
        <>
          <div id="report-content">
            <h3 className="text-2xl font-bold text-indigo-500 mb-6 text-center">
              Sales and Quantity Distribution
            </h3>
            <div id="remove-this" className="flex items-center justify-center">
              <FilterElement
                startDate={start}
                setStartDate={setStartDate}
                endDate={end}
                setEndDate={setEndDate}
                onFilter={onFilter}
                onReset={reset}
              />
            </div>
            <div className="flex items-center justify-center gap-6">
              {/* Sales Chart */}
              <div className="w-2/5 max-w-lg h-auto text-center">
                <h4 className="text-lg font-bold mb-4">Sales Distribution</h4>
                <h5 className="mb-2">
                  This chart displays the distribution based on the product with
                  the most revenue.
                </h5>
                <h5 className="mb-2">
                  From this chart, we will be able to determine the product that
                  brings in the most revenue.
                </h5>
                {chartData ? (
                  <Pie
                    ref={chartRefSales}
                    data={chartData}
                    options={chartData.options}
                  />
                ) : (
                  <p>Error Loading Sales Chart</p>
                )}
              </div>

              <div className="h-200 w-1 bg-indigo-500 rounded-full"></div>

              {/* Quantity Chart */}
              <div className="w-2/5 max-w-lg h-auto text-center">
                <h4 className="text-lg font-bold mb-4">Product Distribution</h4>
                <h5 className="mb-2">
                  This chart displays the distribution of products.
                </h5>
                <h5 className="mb-2">
                  From this chart, we will be able to determine the most popular
                  product based on the quantity sold.
                </h5>
                {chartDataQty ? (
                  <Pie
                    ref={chartRefQty}
                    data={chartDataQty}
                    options={chartDataQty.options}
                  />
                ) : (
                  <p>Error Loading Quantity Chart</p>
                )}
              </div>
            </div>
            <div className="divider divider-accent"></div>
          </div>
        </>
      ) : (
        <>
          <ReportsIndividualProducts products={products} />
          <div className="flex justify-center mt-1 pb-6">
            <button
              id="remove-this"
              className="btn btn-accent"
              onClick={printPDF}
            >
              Generate PDF Report
            </button>
          </div>
          <div className="divider divider-accent"></div>
        </>
      )}
      <h3 className="text-2xl font-bold text-indigo-500 mb-6 text-center">
        Customer Sales Report
      </h3>
      <div className="flex flex-col items-center mb-6">
        <ReportsCompanySales token={token} />
      </div>
      <div className="divider divider-accent"></div>
      <div id="remove-this">
        <h3 className="text-2xl font-bold text-indigo-500 mb-6 text-center">
          Customer Purchase History
        </h3>
        <div className="flex flex-col items-center mb-6">
          <CompanyDropdown
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
            token={token}
          />
          <ReportsCompanyHistory
            selectedCompany={selectedCompany}
            token={token}
          />
        </div>
        <div className="divider divider-accent"></div>
        <div className="flex justify-center mt-1 pb-6 gap-x-4">
          <button
            id="remove-this"
            className="btn btn-accent"
            onClick={printPDF}
          >
            Generate PDF Report
          </button>
          <button
            id="remove-this"
            className="btn btn-accent"
            onClick={redirectdefect}
          >
            View Defect Report
          </button>
        </div>
      </div>
    </>
  );
};

export default ReturnReports;
