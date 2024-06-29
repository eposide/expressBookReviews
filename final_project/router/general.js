const express = require('express');

//Implementation of books as a promise
let myPromiseBooks = new Promise((resolve, reject) => {
  try {
      let books = require("./booksdb.js");
      resolve(books);
  } catch (error) {
      reject(error);
  }
});


let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

myPromiseBooks.then((books) => {
  // Now you have the books, you can initialize other resources dependent on books
  // Initialize routes that depend on the books
  // Get the book list available in the shop
  public_users.get('/',function (req, res) {
  //Write your code here

    return res.status(200).send(JSON.stringify(books, null, 1));
 
  });
});

myPromiseBooks.then((books) => {
// Get book details based on ISBN
  public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    let isbn = req.params.isbn; 
    if (isbn) {
      return res.status(200).send(JSON.stringify(books[isbn], null, 1));
    } else {
      return res.status(422).send("The isbn is not valid");
  }
 
  });
});
  

myPromiseBooks.then((books) => {
  // Get book details based on author
  public_users.get('/author/:author',function (req, res) {
    //Write your code here

    let author = req.params.author;
    let filtered_books = [];
    if (author) {
      for (let key in books) { 
        let book = books[key];
        if (book.author === author) {
          filtered_books.push(book);
        }
      }
      if (filtered_books.length > 0) { 
        return res.status(200).send(JSON.stringify(filtered_books,null,4));
      } else {
        return res.status(422).send("No books found for " + author);
      }
      
    } else {
      return res.status(422).send("The author should be valid");
    }
  });
});

myPromiseBooks.then((books) => {

  // Get all books based on title
  public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;
    let filtered_books = [];
    if (title) {
      for (let key in books) { 
        let book = books[key];
        if (book.title === title) {
          filtered_books.push(book);
        }
      }
      if (filtered_books.length > 0) { 
        return res.status(200).send(JSON.stringify(filtered_books,null,4));
      } else {
        return res.status(422).send("No books found for " + title);
      }
      
    } else {
      return res.status(422).send("The title should be valid");
    }

  });
});

myPromiseBooks.then((books) => {
  //  Get book review
  public_users.get('/review/:isbn',function (req, res) {
    //Write your code here
    let isbn = req.params.isbn; 
    if (isbn) {
      let book = books[isbn];

      if (book) { 

        let reviews = book.reviews;
        if (reviews) {
          return res.status(200).send(book.title + ":" + JSON.stringify(reviews,null,4));
        } else {
          
          return res.status(422).send("no reviews found for book " + book.title);
        }

      } else {
        return res.status(422).send("book not found for isbn " + isbn);
      }

    } else {
      return res.status(422).send("The isbn is not valid");
    }
  

  });
});

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

module.exports.general = public_users;
