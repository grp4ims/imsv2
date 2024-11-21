import React from "react";

const ReportsIndividualProducts = ({ products }) => {
  return (
    <>
      <h3 className="text-2xl font-bold text-indigo-500 mb-6 text-center">
        Product Sales
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto items-center">
        {products.map((product, index) => (
          <div key={index} className="card bg-base-100 shadow-xl mx-2 my-4">
            <div className="card-body">
              <h2 className="card-title">{product.Product_Name}</h2>
              <p>Sold Quantity: {product.Qty_Sold}</p>
              <p>Total Sales: $ {product.Total_Sales.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReportsIndividualProducts;
