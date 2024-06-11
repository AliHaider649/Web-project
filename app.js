const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'backend',
    password: 'ali',
    database: 'newdb'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Serve the main HTML form page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the registration page
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post("/register", function (req, res) {
    const { email, name, password } = req.body;

    console.log("Signup form submission received:", { email, name, password });

    bcrypt.hash(password, 5, function (err, hashedPassword) { 
        if (err) {
            console.error("Error hashing password:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        db.query("INSERT INTO user (email, name, password) VALUES (?, ?, ?)", [email, name, hashedPassword], function (error, results, fields) { 
            if (error) {
                console.error("Signup error:", error);
                res.status(500).send("Internal Server Error");
                return;
            }
            console.log("User signed up successfully!");
            res.sendFile(path.join(__dirname, 'index.html'));
        });
    });
});
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM user WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if (isPasswordValid) {
                // Redirect to index.html after successful login
                res.redirect('/index.html');
            } else {
                res.status(401).send('Invalid email or password');
            }
        } else {
            res.status(401).send('Invalid email or password');
        }
    });
});

// Serve the index.html file
app.get('/Homepage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
