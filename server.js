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

let clientIp = '';

// Middleware to retrieve client's IP address
const http = require('http');

app.use((req, res, next) => {
  // Function to get the public IP address
  function getPublicIPAddress() {
    // Return a promise that resolves with the IP address
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.ipify.org',
        path: '/?format=json',
        method: 'GET'
      };

      const request = http.request(options, response => {
        let data = '';
        response.on('data', chunk => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const ipData = JSON.parse(data);
            resolve(ipData.ip.replace(/\./g, '_'));
          } catch (error) {
            reject(error);
          }
        });
      });

      request.on('error', error => {
        reject(error);
      });

      request.end();
    });
  }

  // Call the function to get the IP address
  getPublicIPAddress()
    .then(ip => {
      // Set the client's IP address
      clientIp = '_' + ip;
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
    })
    .catch(error => {
      console.error('Error fetching IP address:', error);
    })
    .finally(() => {
      next(); // Call next middleware
    });
});


// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route to fetch data from MySQL and send it to the client
app.get('/data', (req, res) => {
  const query = `SELECT * FROM ${clientIp}`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results); // Sending fetched data as JSON response
  });
});

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(bodyParser.json());
//new form entry
app.use(express.json()); // Middleware to parse JSON bodies
app.post('/submit-form', (req, res) => {
  // Extract form data from request body
  const { url, tags, category } = req.body;

  let title = "Bookmark";
  let faviconLink ="https://img.icons8.com/?size=256&id=3685&format=png";
  let favorite = 1;

  // Construct the data object to be inserted into the database
  const data = {title, url,faviconLink,tags,category,favorite};

  // Perform database operation to insert the data into the specified table
  const query = `INSERT INTO ${clientIp} SET ?`;
  connection.query(query, data, (error, results) => {
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
});
