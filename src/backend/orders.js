const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.get('/exportCartData', (req, res) => {
    const userID = req.query.userID; 
    if (!userID) {
      console.error("UserID is missing in the request");
      return res.status(400).send('UserID is required');
    }

    console.log("Fetching orders for userID:", userID); 

    const query = `
      SELECT Orders.OrderID, Orders.UserID, Orders.Order_Date, Orders.Order_Delivery_Date, Orders.Order_Cost,
             Order_Info.ProductID, Order_Info.Order_Qty, Order_Info.Product_Name, Orders.Status 
      FROM Orders
      JOIN Order_Info ON Orders.OrderID = Order_Info.OrderID
      WHERE Orders.UserID = ?
    `;

    db.all(query, [userID], (err, rows) => {
      if (err) {
        console.error("Error executing query:", err.message); 
        return res.status(500).send('Unable to retrieve order data');
      }

      if (!rows || rows.length === 0) {
        console.log("No orders found for userID:", userID);
        return res.status(404).send('No orders found for the user');
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

      console.log("Formatted orders response:", Object.values(orders));
      res.json(Object.values(orders));
    });
  });


  router.post('/exportCartData', (req, res) => {
    const { userID, items } = req.body;

    if (!userID) {
      console.error("UserID is missing in the request");
      return res.status(400).json({ message: 'UserID is required' });
    }

    if (!items || items.length === 0) {
      console.error("Items are missing in the request");
      return res.status(400).json({ message: 'Items are required' });
    }

    console.log("Creating order for userID:", userID); 

    let orderCost = 0;
    items.forEach((item) => {
      orderCost += item.Product_Cost * item.quantity;
    });

    const orderDate = new Date().toISOString().split('T')[0];
    const deliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 

    db.get("SELECT MAX(OrderID) AS maxOrderID FROM Orders", (err, row) => {
      if (err) {
        console.error("Error retrieving max OrderID:", err.message);
        return res.status(500).json({ message: 'Error retrieving max OrderID' });
      }

      const newOrderId = (row.maxOrderID === null) ? 1 : row.maxOrderID + 1;

      const insertOrderQuery = `
        INSERT INTO Orders (OrderID, UserID, Order_Date, Order_Delivery_Date, Order_Cost, Status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const insertOrderInfoQuery = `
        INSERT INTO Order_Info (OrderID, ProductID, Order_Qty, Product_Name)
        VALUES (?, ?, ?, ?)
      `;

      const decrementProductQtyQuery = `
        UPDATE Product
        SET Product_Qty = Product_Qty - ?
        WHERE Product_ID = ?
      `;

      db.run(insertOrderQuery, [newOrderId, userID, orderDate, deliveryDate, orderCost, "Pending"], function (err) {
        if (err) {
          console.error("Error inserting into Orders table:", err.message);
          return res.status(500).json({ message: 'Error creating new order' });
        }

        const insertAndUpdatePromises = items.map((item) => {
          return new Promise((resolve, reject) => {
            db.run(insertOrderInfoQuery, [newOrderId, item.Product_ID, item.quantity, item.Product_Name], function (err) {
              if (err) {
                console.error("Error inserting into Order_Info table:", err.message);
                reject(err);
              } else {
                resolve();
              }
              db.run(decrementProductQtyQuery, [item.quantity, item.Product_ID], function (err) {
                if (err) {
                  console.error("Error updating product quantity:", err.message);
                  return reject(err);
                }
                resolve();
              });
            });
          });
        });

        Promise.all(insertAndUpdatePromises)
          .then(() => res.status(200).json({ message: 'Checkout successful', orderId: newOrderId }))
          .catch((error) => {
            console.error("Error inserting order details:", error.message);
            res.status(500).json({ message: 'Error inserting order details' });
          });
      });
    });
  });
  return router;
};
