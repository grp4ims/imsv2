const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/allOrders', (req, res) => {
    const query = `
      SELECT Orders.OrderID, Orders.UserID, Orders.Order_Date, Orders.Order_Delivery_Date, Orders.Order_Cost,
             Orders.Status,  -- Include the Status field
             Order_Info.ProductID, Order_Info.Order_Qty, Order_Info.Product_Name
      FROM Orders
      JOIN Order_Info ON Orders.OrderID = Order_Info.OrderID
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error executing query:", err.message);
        return res.status(500).send('Unable to retrieve all orders');
      }

      if (!rows || rows.length === 0) {
        console.log("No orders found");
        return res.status(404).send('No orders found');
      }
  
      const orders = rows.reduce((acc, row) => {
        const {
          OrderID,
          UserID,
          Order_Date,
          Order_Delivery_Date,
          Order_Cost,
          Status,
          ProductID,
          Order_Qty,
          Product_Name
        } = row;

        if (!acc[OrderID]) {
          acc[OrderID] = {
            OrderID,
            UserID,
            Order_Date,
            Order_Delivery_Date,
            Order_Cost,
            status: Status,
            items: []
          };
        }

        acc[OrderID].items.push({
          ProductID,
          Product_Name,
          Order_Qty
        });

        return acc;
      }, {});

      res.json(Object.values(orders));
    });
  });

  router.post('/acceptOrder', (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
      console.error("Order ID is missing in the request body");
      return res.status(400).send('Order ID is required');
    }

    const query = `UPDATE Orders SET status = 'Accepted' WHERE OrderID = ?`;

    db.run(query, [orderId], (err) => {
      if (err) {
        console.error("Error accepting order:", err.message);
        return res.status(500).send('Failed to accept order');
      }
      res.status(200).send('Order accepted successfully');
    });
  });

  router.post('/rejectOrder', (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
      console.error("Order ID is missing in the request body");
      return res.status(400).send('Order ID is required');
    }

    const query = `UPDATE Orders SET status = 'Rejected' WHERE OrderID = ?`;

    db.run(query, [orderId], (err) => {
      if (err) {
        console.error("Error rejecting order:", err.message);
        return res.status(500).send('Failed to reject order');
      }
      res.status(200).send('Order rejected successfully');
    });
  });

  return router;
};
