import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const ReportsCompanyHistory = ({ selectedCompany, token }) => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  const fetchPurchaseHistory = async () => {
    if (!selectedCompany) {
      alert("Please select a company first.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:3002/reports/companies-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyName: selectedCompany },
        }
      );
      setPurchaseHistory(response.data); // Store data for rendering
      setShowHistoryTable(true); // Show table
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  // CSV Download
  const generateCSV = () => {
    if (purchaseHistory.length === 0) {
      alert("No records available to export.");
      return;
    }
    const csvData = Papa.unparse(purchaseHistory, {
      header: true,
    });
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${selectedCompany}_Purchase_History.csv`);
  };

  // Reset button
  const resetState = () => {
    setShowHistoryTable("");
    setPurchaseHistory([]);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center gap-4">
        <button
          className="btn btn-accent px-4 py-2"
          onClick={fetchPurchaseHistory}
        >
          View Purchase History
        </button>
        <button
          className="btn btn-primary px-4 py-2"
          onClick={generateCSV}
          disabled={purchaseHistory.length === 0}
        >
          Download CSV
        </button>
        <button className="btn btn-danger px-4 py-2" onClick={resetState}>
          Reset
        </button>
      </div>

      {/* Render table */}
      {showHistoryTable && (
        <div className="w-full max-w-4xl mx-auto mt-6">
          {purchaseHistory.length > 0 ? (
            <>
              <h4 className="text-xl font-bold text-center mb-4">
                Purchase History for {selectedCompany}
              </h4>
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="border border-gray-300 px-4 py-2">
                        Company Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Product Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Order Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">
                          {record.Company_Name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {record.Product_Name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {record.Order_Qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center mt-6">
              <p>No purchase history found for {selectedCompany}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsCompanyHistory;
