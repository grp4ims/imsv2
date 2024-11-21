import React from "react";

const FilterElement = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onFilter,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="flex items-center gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-48 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-md transition-all"
          />
        </div>
        {/* End Date */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-48 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-md transition-all"
          />
        </div>
      </div>
      {/* Button below start and end date */}
      <div className="flex gap-4">
        <button className="btn btn-accent w-25 px-3 text-sm" onClick={onFilter}>
          Apply Filter
        </button>
        <button className="btn btn-accent w-25 px-3 text-sm" onClick={onReset}>
          Reset Filter
        </button>
      </div>
    </div>
  );
};

export default FilterElement;
