const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  if (username.length < 2) { 
    return false;
  };
  if (!users.includes(username)) {
    return true;
  } 
  return false;
}

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
 
  const username = req.body.username;
  const password = req.body.password;

    // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

    // Authenticate user
  if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
  } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  let isbn = req.params.isbn; 
  let review = req.body.review;

  let username = req.session.authorization.username

  if (!review) {
    return res.status(422).json({ message: "a review must be provided" });
  }

  let book = books[isbn];

  if (!book) {
    return res.status(422).json({ message: "could not find book for " + isbn});
  }

  book.reviews[username] = review; 
  
  return res.status(200).json({message: "review submitted", "book" : books[isbn]});

});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  let isbn = req.params.isbn; 

  let username = req.session.authorization.username

  let book = books[isbn];

  if (!book) {
    return res.status(422).json({ message: "could not find book for " + isbn});
  }

  delete book.reviews[username];

  return res.status(200).json({ message :"review for " + username + " has been deleted", "book" : books[isbn]});

});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
