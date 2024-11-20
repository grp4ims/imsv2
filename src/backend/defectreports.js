const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.get('/getAllDefectReports', (req, res) => {
    console.log("Fetching all defect reports");
    const query = `
      SELECT DISTINCT Defect_Info.DefectID, Defect_Info.ProductID, Defect_Info.Defect_Category, Defect_Info.Defect_Qty,
                      Order_Info.Product_Name, Orders.OrderID, Orders.UserID
      FROM Defect_Info
          JOIN Defect ON Defect_Info.DefectID = Defect.DefectID
      JOIN Order_Info ON Defect_Info.ProductID = Order_Info.ProductID  
      JOIN Orders ON Defect.OrderID = Orders.OrderID  
    `;

    db.all(query, (err, rows) => {
      if (err) {
        console.error("Error executing defect report query:", err.message);
        return res.status(500).send('Unable to retrieve defect reports');
      }
      res.json(rows);
    });
  });

  return router;
};
