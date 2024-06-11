const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const { name } = require("ejs");

const app = express();
const encoder = bodyParser.urlencoded({ extended: false }); // Changed true to false

// Create a connection to the database
const connection = mysql.createConnection({
    host: "localhost",   
    user: "backend",   
    password: "ali", 
    database: "newdb"    
});

// Connect to the database
connection.connect(function (error) {
    if (error) {
        console.error("Error connecting to the database:", error);
        return;
    }
    console.log("Connected to the database successfully!");
});

app.use(encoder);

app.use(express.static(path.join(__dirname, 'views'))); 

// Handle root URL by redirecting to login page
app.get("/", function (req, res) {
    res.redirect("/login");
});

// Serve the login page
app.get("/login", function (req, res) { 
    res.sendFile(path.join(__dirname, 'login.html')); 
});

// Handle login form submission
app.post("/login", function (req, res) {
    const password = req.body.password;
    const email = req.body.email;

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
                    res.sendFile(path.join(__dirname, 'index.html'));
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

// Serve the signup page
app.get("/registration", function (req, res) {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// Handle signup form submission
app.post("/register", function (req, res) {
    const { email, name, password } = req.body;

    console.log("Signup form submission received:", { email, name, password });

    bcrypt.hash(password, 5, function (err, hashedPassword) { 
        if (err) {
            console.error("Error hashing password:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        connection.query("INSERT INTO user (email, name, password) VALUES (?, ?, ?)", [email, name, hashedPassword], function (error, results, fields) { 
            if (error) {
                console.error("Signup error:", error);
                res.status(500).send("Internal Server Error");
                return;
            }
            console.log("User signed up successfully!");
            res.send('user registered successfully');
            
            res.sendFile(path.join(__dirname, 'login.html'));
        });
    });
});

app.get("/homepage", function (req, res) { 
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Set the app to listen on port 3000
app.listen(3000, function () { 
    console.log("Server is running on port 3000");
});
