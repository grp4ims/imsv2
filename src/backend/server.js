const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3002;

const products = require('./products')
const auth_jwt = require('./auth_jwt')
const login = require('./login')
const register = require('./register')
const customer = require('./customer')
const reports = require('./reports')
const customer_view = require('./customer-view')
const orders = require('./orders')

const defects = require('./defects'); 
const purchaseorders = require('./purchaseorders')
const defectreports = require('./defectreports')


const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200,
};

const db = new sqlite3.Database('./src/backend/prototypeV1.db', (err) => {
  if (err) {
    console.error('[-] Error connecting to the database:', err.message);
  } else {
    console.log('[+] Connected to the SQLite database.');
  }
});

app.use(cors(corsOptions)); 
app.use(express.json()); 

app.use('/products',products(db))
app.use('/auth_jwt',auth_jwt)
app.use('/login',login(db))
app.use('/register',register(db))
app.use('/customer',customer(db))
app.use('/reports',reports(db))
app.use('/customer-view',customer_view(db))
app.use('/orders', orders(db))

app.use('/purchaseorders',purchaseorders(db))
app.use('/defects', defects(db));
app.use('/defectreports', defectreports(db));




app.listen(port, () => {
  console.log(`[+] Server running on http://localhost:${port}`);
});