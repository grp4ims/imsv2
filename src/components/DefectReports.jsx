import React, { useState, useEffect } from "react";

const DefectReports = () => {
  const [defectReports, setDefectReports] = useState([]);
  const [error, setError] = useState(null);

  const fetchDefectReports = async () => {
    try {
      const response = await fetch("http://localhost:3002/defectreports/getAllDefectReports");
      if (!response.ok) {
        throw new Error("Failed to fetch defect reports");
      }
      const data = await response.json();
      setDefectReports(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load defect reports");
    }
  };

  useEffect(() => {
    fetchDefectReports();
  }, []);

  const handleRefresh = () => {
    fetchDefectReports();
  };

const convertToCSV = (data) => {
  const headers = ["Order ID", "Product Name", "Product ID", "Defect Category", "Defect Quantity"];
  const csvRows = [headers.join(",")];

  data.forEach((DefectReports) => {
    const row = [
      DefectReports.OrderID,
      `"${DefectReports.Product_Name}"`, 
      DefectReports.ProductID,
      DefectReports.Defect_Category,
      DefectReports.Defect_Qty,
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};


const downloadCSV = (csvData) => {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "defect_reports.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleExportCSV = () => {
    const csvData = convertToCSV(defectReports);
    downloadCSV(csvData);
  };


  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 text-center">Defect Reports</h1>
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export CSV
        </button>
      </div>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="py-2 px-4 border-r border-gray-300 text-center">Order ID</th>
              <th className="py-2 px-4 border-r border-gray-300 text-center">Product Name</th>
              <th className="py-2 px-4 border-r border-gray-300 text-center">Product ID</th>
              <th className="py-2 px-4 border-r border-gray-300 text-center">Defect Category</th>
              <th className="py-2 px-4 text-center">Defect Quantity</th>
            </tr>
          </thead>
          <tbody>
            {defectReports.map((DefectReports, index) => (
              <tr key={index} className="border-t border-gray-300">
                <td className="py-2 px-4 border-r border-gray-300 text-center">{DefectReports.OrderID}</td>
                <td className="py-2 px-4 border-r border-gray-300 text-center">{DefectReports.Product_Name}</td>
                <td className="py-2 px-4 border-r border-gray-300 text-center">{DefectReports.ProductID}</td>
                <td className="py-2 px-4 border-r border-gray-300 text-center">{DefectReports.Defect_Category}</td>
                <td className="py-2 px-4 text-center">{DefectReports.Defect_Qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DefectReports;