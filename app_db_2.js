const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
// Create Express app
const app = express();
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'backend',
  password: 'ali',
  database: 'newdb'
});
// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});
// Serve the registration form
app.get('/register', (req, res) => {
  res.render('registration.ejs');
});
// Handle form submission for registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 2);
  db.query('INSERT INTO user (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while registering the user.');
    }
    res.send('User registered successfully!');
  });
});
// Serve the sign-in form
app.get('/login', (req, res) => {
  res.render('login.ejs');
});
// Handle form submission for login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while logging in.');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found.');
    }
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid password.');
    }
    res.render('index.html', { name: user.name });
  });
});
// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
app.post("/login", function (req, res) {
  const password = req.body.password;

  console.log("Login form submission received:", { email, password });

  connection.query("SELECT * FROM user WHERE email = ?", [email], function (error, results, fields) {
      if (error) {
          console.error("Query error:", error);
          res.status(500).send("Internal Server Error");
          return;
      }
      if (results.length > 0) {
          const user = results[0];
          bcrypt.compare(password, user.password, function (err, result) { 
              if (result) {
                  console.log("Logon successful, sending message to close popup");
                  res.send("<script>window.opener.postMessage('loginSuccess', '*'); window.close();</script>"); // Changed 'loginSuccess' to 'logonSuccess'
              } else {
                  console.log("Login failed, redirecting to /login");
                  res.redirect("/login.html"); 
              }
          });
      } else {
          console.log("Logon failed, redirecting to /login");
          res.redirect("/login.html"); 
      }
  });
});