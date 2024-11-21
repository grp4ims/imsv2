import React, { useState, useEffect } from "react";
import axios from "axios";

const CompanyDropdown = ({ selectedCompany, setSelectedCompany, token }) => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/reports/companies",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompanies(response.data); // Assuming the response contains a list of company names
      } catch (error) {
        console.error("Error fetching company names:", error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="flex items-center gap-6">
        {/* Company Dropdown */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Select Company
          </label>
          <select
            value={selectedCompany}
            onChange={(event) => setSelectedCompany(event.target.value)}
            className="w-48 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-md transition-all"
          >
            <option value="">-- Select a Company --</option>
            {companies.map((company) => (
              <option key={company.UserID} value={company.Company_Name}>
                {company.Company_Name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CompanyDropdown;
