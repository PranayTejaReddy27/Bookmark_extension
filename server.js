const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

let client_Ip = "";
// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(bodyParser.json());
//new form entry
app.use(express.json()); // Middleware to parse JSON bodies
// Serve static files from the 'public' directory
app.use(express.static('public'));

app.post('/endpoint', (req, res) => {
  const {clientIp} = req.body;
  console.log('Received Ip data:', clientIp);
  client_Ip = clientIp;
  res.send('Data received successfully'); // Send a response back to the client
  const query = `SHOW TABLES LIKE '${client_Ip}'`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      return;
    }
    if (results.length === 0) {
      // Create a new table for the client's IP address
      const createTableQuery = `CREATE TABLE IF NOT EXISTS ${clientIp} (
        bookmarkId INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        url VARCHAR(255),
        faviconLink VARCHAR(255),
        tags VARCHAR(255),
        category VARCHAR(255),
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        favorite INT
      )`;
      connection.query(createTableQuery, (error, results) => {
        if (error) {
          console.error('Error creating table:', error);
          return;
        }
        console.log(`Created new table for ${clientIp}`);
      });
    }
  });
});

app.post('/submit-form', (req, res) => {
  // Extract form data from request body
  const { url, tags, category } = req.body;

  let title = "Bookmark";
  let faviconLink ="https://img.icons8.com/?size=256&id=3685&format=png";
  let favorite = 1;

  // Construct the data object to be inserted into the database
  const data = {title, url,faviconLink,tags,category,favorite};

  // Perform database operation to insert the data into the specified table
  const query = `INSERT INTO ?? SET ?`;
  const values = [client_Ip, data];
  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error inserting data into database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Form data inserted successfully:', results);
    res.redirect('/'); // Send a success status code
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`ip_address ${client_Ip}`);
});
