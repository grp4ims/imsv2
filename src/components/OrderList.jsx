import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../userContext";
import { parseISO, isAfter, isEqual } from "date-fns"; 

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const { userID } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [showDefectModal, setShowDefectModal] = useState(false); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [defectInfo, setDefectInfo] = useState({}); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [showDefectInfoModal, setShowDefectInfoModal] = useState(false); 
  const [defects, setDefects] = useState([]); 
  const [showPromptModal, setShowPromptModal] = useState(false);  

  const fetchOrders = async () => {
    if (!userID) {
      console.error("userID is undefined in OrderList.jsx");
      setError("User ID is required for fetching orders.");
      return;
    }

    const url = `http://localhost:3002/orders/exportCartData?userID=${userID}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    }
  };

  const fetchDefectInfo = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3002/defects/getDefectInfo?orderId=${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch defect information");
      const data = await response.json();
      setDefects(data);
    } catch (err) {
      console.error("Error fetching defect information:", err);
    }
  };

  const shouldShowDefectButton = (status, deliveryDate) => {
    if (status !== "Accepted") return false;
    const today = new Date();
    try {
      const delivery = parseISO(deliveryDate);
      return isAfter(today, delivery) || isEqual(today, delivery);
    } catch {
      return false;
    }
  };

  const handleReportDefect = async (order) => {
    const response = await fetch(`http://localhost:3002/defects/getDefectInfo?orderId=${order.OrderID}`);
    if (response.ok) {
      const data = await response.json();
      setDefects(data); 
  
      const allDefectsReported = order.items.every((item) =>
        data.some((defect) => defect.ProductID === item.ProductID)
      );
  
      if (allDefectsReported) {
        setShowPromptModal(true); 
        return;
      }
  
      setSelectedOrder(order);
      setDefectInfo(
        order.items.reduce((acc, item) => {
          acc[item.ProductID] = { category: "", quantity: "" };
          return acc;
        }, {})
      );
      setErrorMessage(""); 
      setShowDefectModal(true);
    } else {
      console.error("Failed to fetch defect information");
    }
  };

  const handleViewDefects = async (order) => {
    setSelectedOrder(order);
    await fetchDefectInfo(order.OrderID);
    setShowDefectInfoModal(true);
  };

  const handleDefectChange = (productId, field, value) => {
    if (field === "quantity" && selectedOrder) {
      const orderedItem = selectedOrder.items.find((item) => item.ProductID === productId);
      if (orderedItem && value > orderedItem.Order_Qty) {
        alert(`Defect quantity cannot be greater than the ordered quantity (${orderedItem.Order_Qty}).`);
        return;
      }
    }

    setDefectInfo((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const submitDefectInfo = async () => {
    const itemsWithDefects = Object.entries(defectInfo)
      .filter(([_, info]) => info.category && info.quantity && info.quantity > 0)
      .map(([productId, info]) => ({
        productId,
        category: info.category,
        quantity: info.quantity,
      }));

    for (const [productId, info] of Object.entries(defectInfo)) {
      if (info.quantity > 0 && !info.category) {
        setErrorMessage("Please ensure that both a defect category and a defect quantity are selected for at least one product.");
        return;
      }
    }

    for (const [productId, info] of Object.entries(defectInfo)) {
      if (info.category && !info.quantity) {
        setErrorMessage("Please ensure that both a defect category and a defect quantity are selected for at least one product.");
        return;
      }
    }

    if (itemsWithDefects.length === 0) {
      setErrorMessage("Please provide defect information for at least one item.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/defects/submitDefectInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.OrderID, defects: itemsWithDefects }),
      });
      if (!response.ok) throw new Error("Failed to submit defect information");
      setShowDefectModal(false);
      fetchOrders(); 
    } catch (error) {
      console.error("Error submitting defect information:", error.message);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchOrders();
    }
  }, [userID]);

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name"
            className="p-2 border border-gray-300 rounded-md w-1/4"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {orders.map((order) => {
            const filteredItems = order.items.filter((item) =>
              item.Product_Name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredItems.length === 0) return null;
            const displayDeliveryDate = (order.status === "Rejected" || order.status === "Pending") 
            ? "-" 
            : order.Order_Delivery_Date;        
            return (
              <div key={order.OrderID} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">OrderID: {order.OrderID}</h3>
                <p>Order Date: {order.Order_Date}</p>
                <p>Delivery Date: {displayDeliveryDate}</p>
                <p>Total Cost: ${order.Order_Cost.toFixed(2)}</p>
                <p>Status: {order.status}</p>
                <h4 className="font-semibold mt-2">Items:</h4>
                <ul>
                  {filteredItems.map((item) => (
                    <li key={item.ProductID} className="ml-4">
                      {item.Product_Name} - Quantity: {item.Order_Qty}
                    </li>
                  ))}
                </ul>
                {shouldShowDefectButton(order.status, order.Order_Delivery_Date) && (
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mt-2"
                    onClick={() => handleViewDefects(order)}
                  >
                    View Reported Defects
                  </button>
                )}
                {shouldShowDefectButton(order.status, order.Order_Delivery_Date) && (
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mt-2"
                    onClick={() => handleReportDefect(order)}
                  >
                    Report New Defects
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-lg font-semibold mb-4">Notice</h2>
            <p>All products in this order have already had defects reported.</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setShowPromptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDefectInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-3/4 md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Defect Information</h2>
            {defects.length > 0 ? (
              <ul className="list-disc list-inside">
                {defects.map((defect, index) => (
                  <li key={index}>
                    Product Name: {defect.Product_Name}, Category: {defect.Defect_Category}, Quantity: {defect.Defect_Qty}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No defects reported for this order.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setShowDefectInfoModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDefectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-3/4 md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Report New Defects</h2>
            <p className="text-gray-600 mb-4">
              Each product can only have one defect report submitted. You will not be able to submit a defect report for a product that has already been reported.
            </p>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            {selectedOrder && (
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b">Product Name</th>
                    <th className="py-2 px-4 border-b">Defect Category</th>
                    <th className="py-2 px-4 border-b">Defect Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items
                    .filter((item) => !defects.some((defect) => defect.ProductID === item.ProductID)) 
                    .map((item) => (
                      <tr key={item.ProductID} className="border-t">
                        <td className="py-2 px-4">{item.Product_Name}</td>
                        <td className="py-2 px-4">
                          <select
                            className="p-2 border border-gray-300 rounded-md"
                            value={defectInfo[item.ProductID]?.category || ""}
                            onChange={(e) => handleDefectChange(item.ProductID, "category", e.target.value)}
                          >
                            <option value="">Select Category</option>
                            <option value="Damage">Damage</option>
                            <option value="Missing Parts">Missing Parts</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter defect quantity"
                            value={defectInfo[item.ProductID]?.quantity || ""}
                            onChange={(e) => handleDefectChange(item.ProductID, "quantity", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                onClick={submitDefectInfo}
              >
                Submit
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setShowDefectModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderList;
