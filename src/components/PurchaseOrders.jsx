import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../userContext';

const PurchaseOrders = ({ userID = null }) => {
  const { userRole } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3002/purchaseorders/allOrders');
      if (!response.ok) throw new Error('Failed to fetch purchase orders');

      const data = await response.json();
      const pendingOrders = data.filter(order => order.status?.toLowerCase() === "pending");

      setOrders(pendingOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId) => {
    const confirmAction = window.confirm("Are you sure you want to accept this order?");
    if (!confirmAction) return; 

    try {
      const response = await fetch(`http://localhost:3002/purchaseorders/acceptOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error('Failed to accept order');

      console.log(`Accepted order with ID: ${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleReject = async (orderId) => {
    const confirmAction = window.confirm("Are you sure you want to reject this order?");
    if (!confirmAction) return; 

    try {
      const response = await fetch(`http://localhost:3002/purchaseorders/rejectOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error('Failed to reject order');

      console.log(`Rejected order with ID: ${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  return (
    <div className="purchase-orders">
      <h1 className="text-2xl font-bold mb-4">Purchase Orders</h1>
      {orders.length === 0 ? (
        <p>No pending orders available.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">User ID</th>
              <th className="py-2 px-4 border-b">Order Date</th>
              <th className="py-2 px-4 border-b">Delivery Date</th>
              <th className="py-2 px-4 border-b">Order Cost</th>
              <th className="py-2 px-4 border-b">Items</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.OrderID} className="border-t">
                <td className="py-2 px-4">{order.OrderID}</td>
                <td className="py-2 px-4">{order.UserID}</td>
                <td className="py-2 px-4">{order.Order_Date}</td>
                <td className="py-2 px-4">{order.Delivery_Date}</td>
                <td className="py-2 px-4">${order.Order_Cost}</td>
                <td className="py-2 px-4">
                  <ul className="list-disc list-inside">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.Product_Name} (Qty: {item.Order_Qty})
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2"
                    onClick={() => handleAccept(order.OrderID)}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleReject(order.OrderID)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PurchaseOrders;
