const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        const userAlreadyExists = users.some((user) => user.username === username);
        if (userAlreadyExists) {
            return res.status(409).json({message: "User already exists under this name"});
        } else {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered"});
        }
    }
    return res.status(404).json({message: "Username or password not found"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    let filtered_books = [];
    
    for (let isbn in books) {
        if (books[isbn].author == author) {
            filtered_books.push(books[isbn]);
        }
    }
    if (filtered_books.length == 0) {
        return res.status(404).json({message: "No books with the criteria found"});
    }
    res.send(filtered_books);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let filtered_books = [];
    
    for (let isbn in books) {
        if (books[isbn].title == title) {
            filtered_books.push(books[isbn]);
        }
    }
    if (filtered_books.length == 0) {
        return res.status(404).json({message: "No books with the criteria found"});
    }
    res.send(filtered_books);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews && books[isbn].reviews.length > 0) {
        res.send(books[isbn].reviews);
    } else {
        return res.status(404).json({message: "Book not found or no reviews available"});
    }
});

// Get the book list available in the shop using Promise callback
public_users.get('/async/books', function (req, res) {
    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books)
        }, 100);
    })
    .then(books => {
        res.status(200).send(books);
    })
    .catch(() => {
        res.status(404).send({ message: "Books not found" });
    });
});

// Get the book from ISBN in the shop using Promise callback
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                return reject(new Error("No books found matching criteria"));
            }
        }, 100);
    })
    .then(book => {
        res.status(200).send(book);
    })
    .catch(() => {
        res.status(404).send({ message: "No books found matching criteria" });
    });
});

// Get the books from author in the shop using Promise callback
public_users.get('/async/author/:author', function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            let filtered_books = [];
            
            for (let isbn in books) {
                if (books[isbn].author == author) {
                    filtered_books.push(books[isbn]);
                }
            }
            if (filtered_books.length == 0) {
                return reject(new Error("No books found"));
            }
            resolve(filtered_books);
        }, 100);
    })
    .then(filtered_books => {
        res.status(200).send(filtered_books);
    })
    .catch(() => {
        res.status(404).send({ message: "No books found matching criteria" });
    });
});

// Get the books from title in the shop using Promise callback
public_users.get('/async/title/:title', function (req, res) {
    const title = req.params.title;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            let filtered_books = [];
            
            for (let isbn in books) {
                if (books[isbn].title == title) {
                    filtered_books.push(books[isbn]);
                }
            }
            if (filtered_books.length == 0) {
                return reject(new Error("No books found"));
            }
            resolve(filtered_books);
        }, 100);
    })
    .then(filtered_books => {
        res.status(200).send(filtered_books);
    })
    .catch(() => {
        res.status(404).send({ message: "No books found matching criteria" });
    });
});

module.exports.general = public_users;
