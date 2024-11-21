const express = require('express');
const router = express.Router();

module.exports = (db) => {  
    router.get('/prod',(req, res) => {
        // If no parameters are provided, run this.
        if (!req.query.start || !req.query.end) {
            const query = `SELECT DISTINCT SUM(Order_Info.Order_Qty) AS Qty_Sold,Product.Product_Name,SUM(Order_Info.Order_Qty * Product.Product_Cost) AS Total_Sales
                    FROM Order_Info
                    INNER JOIN Product ON Order_Info.ProductID = Product.Product_ID
                    INNER JOIN Orders ON Order_Info.OrderID = Orders.OrderID
                    GROUP BY Order_Info.ProductID
                    ORDER BY Total_Sales DESC
            `;
            db.all(query, (err, rows) => {
            if (err) {
                console.error(err.message)
                // 500 is web server error - even though its SQl related, just categorise as 500.
                res.status(500).send('Unable to retrieve all products');
            } else {
                // This should be consistent to the frontend - like data is the frontend looking for.
                res.json(rows);
            }
            });
        } else {
            const start_date = req.query.start;
            const end_date = req.query.end;
            const query = `SELECT DISTINCT SUM(Order_Info.Order_Qty) AS Qty_Sold,Product.Product_Name,SUM(Order_Info.Order_Qty * Product.Product_Cost) AS Total_Sales
                    FROM Order_Info
                    INNER JOIN Product ON Order_Info.ProductID = Product.Product_ID
                    INNER JOIN Orders ON Order_Info.OrderID = Orders.OrderID
                    WHERE Order_Date BETWEEN ? AND ? 
                    GROUP BY Order_Info.ProductID
                    ORDER BY Total_Sales DESC`;
            db.all(query,[start_date, end_date],(err, rows) => {
            if (err) {
                console.error(err.message)
                // 500 is web server error - even though its SQl related, just categorise as 500.
                res.status(500).send('Unable to retrieve all products');
            } else {
                // This should be consistent to the frontend - like data is the frontend looking for.
                res.json(rows);
            }
            });
        }
    });
    router.get('/companies',(req, res) => {
        db.all(`SELECT UserID,Company_Name
                FROM Customer;
            `, (err, rows) => {
            if (err) {
                console.error(err.message)
                // 500 is web server error - even though its SQl related, just categorise as 500.
                res.status(500).send('Unable to retrieve all products');
            } else {
                // This should be consistent to the frontend - like data is the frontend looking for.
                //console.log('I returned this' + rows);
                res.json(rows);
            }
            });
    });
    router.get('/companies-sales',(req, res) => {
        // If no parameters are provided, run this.
        const query = 
        `SELECT DISTINCT Customer.UserID,Customer.Company_Name,SUM(Order_Info.Order_Qty * Product.Product_Cost) AS Total_Sales
        FROM Orders
        INNER JOIN Customer ON Orders.UserID = Customer.UserID
        INNER JOIN Order_Info ON Orders.OrderID = Order_Info.OrderID
        INNER JOIN Product ON Order_Info.ProductID = Product.Product_ID
        GROUP BY Customer.Company_Name
        ORDER BY Customer.UserID ASC`;
        db.all(query,(err, rows) => {
        if (err) {
            console.error(err.message)
            // 500 is web server error - even though its SQl related, just categorise as 500.
            res.status(500).send('Unable to retrieve all products');
        } else {
            // This should be consistent to the frontend - like data is the frontend looking for.
            res.json(rows);
        }
        });
    });
    router.get('/companies-history',(req, res) => {
        // If no parameters are provided, run this.
        if (!req.query.companyName) {
            res.status(500).send('Invalid request.');
        } else {
            const company = req.query.companyName;
            const query = 
            `SELECT DISTINCT Customer.Company_Name, Order_Info.Product_Name, SUM(Order_Info.Order_Qty) as Order_Qty 
            FROM Orders
            INNER JOIN Customer ON Customer.UserID = Orders.UserID
            INNER JOIN Order_Info ON Order_Info.OrderID = Orders.OrderID
            WHERE Customer.Company_Name = ?
            GROUP BY Customer.Company_Name, Order_Info.Product_Name
            ORDER BY Order_Qty DESC;`;
            db.all(query,company,(err, rows) => {
            if (err) {
                console.error(err.message)
                // 500 is web server error - even though its SQl related, just categorise as 500.
                res.status(500).send('Unable to retrieve all products');
            } else {
                // This should be consistent to the frontend - like data is the frontend looking for.
                res.json(rows);
            }
            });
        }
    });
  
    return router;
  };
