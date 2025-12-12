const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return username && username.trim().length > 0 && !username.includes(' ');
}

const authenticatedUser = (username,password)=>{ //returns boolean
    const user = users.find(user => user.username === username && user.password === password);
    return !!user;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (authenticatedUser(username, password)) {
            const accessToken = jwt.sign(
                {username: username},
                "access",
                { expiresIn: '1h' }
            );
            if (!req.session) {
                return res.status(500).send({message: "Session not initialized"});
            }
            req.session.authorization = { accessToken, username };
    
            return res.status(200).send({
                message: "User successfully logged in",
                token: accessToken
            });
        } else {
            return res.status(401).json({message: "Incorrect name or password"});
        }
    }
    return res.status(404).json({message: "Username or password not found"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    if (!req.user || !req.user.username) {
        return res.status(401).json({message: "User not authorized"});
    }
    const username = req.user.username;

    const isbn = req.params.isbn;
    const review = req.query.review;
    if (!isbn || !books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }
    if (!review) {
        return res.status(404).json({message: "Review required"});
    }
    books[isbn].reviews[username] = review;
    return res.status(200).json({message: `Review successfully added to ISBN ${isbn}`});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (!req.session || !req.session.authorization || !req.session.authorization.username) {
        return res.status(401).json({message: "User not authorized"});
    }
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({message: "Review not found"});
    }
    delete books[isbn].reviews[username];
    return res.status(200).json({message: `Review successfully removed from ISBN ${isbn}`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
