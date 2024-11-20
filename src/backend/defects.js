const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post('/submitDefectInfo', (req, res) => {
    const { orderId, defects } = req.body;
    if (!orderId || !defects || defects.length === 0) {
      return res.status(400).send('Order ID and defects are required');
    }

    const insertDefectQuery = `INSERT INTO Defect (OrderID) VALUES (?)`;

    db.run(insertDefectQuery, [orderId], function (err) {
      if (err) {
        console.error("Error inserting into Defect table:", err.message);
        return res.status(500).send('Failed to insert defect');
      }

    const defectID = this.lastID; 

    const insertDefectInfoQuery = `
      INSERT INTO Defect_Info (DefectID, ProductID, Defect_Category, Defect_Qty)
      VALUES (?, ?, ?, ?)
    `;

    const insertPromises = defects.map(({ productId, category, quantity }) => {
      return new Promise((resolve, reject) => {
        console.log(`Inserting defect info for ProductID: ${productId}, Category: ${category}, Quantity: ${quantity}`);

        db.run(insertDefectInfoQuery, [defectID, productId, category, quantity], (err) => {
          if (err) {
            console.error("Error inserting into Defect_Info table:", err.message);

            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(insertPromises)
        .then(() => {
          console.log("All defect information inserted successfully");
          res.status(200).send('Defect information submitted successfully');
        })
        .catch((error) => {
          console.error("Error inserting defect info:", error.message);
          res.status(500).send('Failed to submit defect information');
        });
    });
  });

  router.get('/getDefectInfo', (req, res) => {
    const { orderId } = req.query;
    if (!orderId) {
      return res.status(400).send('Order ID is required');
    }

    const defectQuery = `
    SELECT DISTINCT Defect_Info.ProductID, Defect_Info.Defect_Category, Defect_Info.Defect_Qty, Order_Info.Product_Name
    FROM Defect_Info
    JOIN Order_Info ON Defect_Info.ProductID = Order_Info.ProductID
    WHERE Defect_Info.DefectID IN (SELECT DefectID FROM Defect WHERE OrderID = ?)
`;

    db.all(defectQuery, [orderId], (err, rows) => {
      if (err) {
        return res.status(500).send('Unable to retrieve defect information');
      }
      res.json(rows); 
    });
  });

  return router;
};
