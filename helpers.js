const getUserByEmail = function(email, database) {
  for (key in database) {     // lookup magic...
    if (email === database[key].email) {
      return key;
    }
  }
};

const getLoggedInUser = function (req, res) {
  return users[req.session.userId];
};

const urlsForUser = function (userId, urlDatabase) {
  const urls = {};
  for (key in urlDatabase) {// Build URLS object
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

function authenticateUser(email, password) {
  for (let user in users) {
    // if (users[user].email === email && users[user].password === password) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      //   console.log(user);
      return users[user];
    }
  }
};

function existingUser(email) {
  for (let user in users) {
    if (users[user].email === email)
      return true;
  }
  return false;
};

//Generates a string of six random alphanumeric characters
function generateRandomString() {
  let randomAlphNum = Math.random().toString(36).substring(6);
  return randomAlphNum;
};

module.exports = { getUserByEmail, getLoggedInUser, urlsForUser, authenticateUser, existingUser, generateRandomString };