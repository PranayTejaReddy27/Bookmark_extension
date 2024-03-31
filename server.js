const express = require('express');
const mysql = require('mysql');
const app = express();
const { spawn } = require('child_process');

// Middleware to retrieve client's IP address
app.use((req, res, next) => {
  const clientIp = req.ip.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize IP address for use as a table name; // Retrieve IP address from request object

  // Create MySQL connection
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bookmarks'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL');

    // Check if table exists for the client's IP address
    const query = `SHOW TABLES LIKE '${clientIp}'`;
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

  next();
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route to fetch data from MySQL and send it to the client
app.get('/data', (req, res) => {
  const query = 'SELECT * FROM ${clientIp}'; // Replace 'posts' with your table name
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results); // Sending fetched data as JSON response
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
