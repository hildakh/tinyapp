const bcrypt = require('bcrypt');     //Required for authenticateUser function

const getUserByEmail = function(email, database) {      //Looks up the user's email in the users database and returns the user's random
for (const key in database) {                          //ID or undefined 
    if (email === database[key].email) {
      return key;
    } return undefined;
  }
};

const getLoggedInUser = function(req, users) {          //Finds the random ID of the user who has logged in to later access
  return users[req.session.userId];                     // the database based on the id and present the user with their own short and 
};                                                      // urls

const urlsForUser = function(userId, urlDatabase) {
  const urls = {};
  for (const key in urlDatabase) {// Build URLS object
    // Loop through urlDatabase keys
    if (userId === urlDatabase[key].userId) {
      // Check to see if userId matches url's userId
      // console.log(key);// If it does, add key-value pair to urls object
      // console.log(key + ': ', urlDatabase[key]);
      urls[key] = urlDatabase[key];
      // console.log(urls);
    }
  }
  return urls;
};

const authenticateUser = function(email, password, users) {
  for (let user in users) {
    // if (users[user].email === email && users[user].password === password) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      //   console.log(user);
      return users[user];
    }
  }
};

const existingUser = function (email, users) {
  for (let user in users) {
    if (users[user].email === email)
      return true;
  }
  return false;
}

//Generates a string of six random alphanumeric characters
const generateRandomString = function () {
  let randomAlphNum = Math.random().toString(36).substring(6);
  return randomAlphNum;
}

module.exports = { getUserByEmail, getLoggedInUser, urlsForUser, authenticateUser, existingUser, generateRandomString };