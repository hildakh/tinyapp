const { getUserByEmail, getLoggedInUser, urlsForUser, authenticateUser, existingUser, generateRandomString } = require('./helpers');
const express = require('express');
const app = express();
const PORT = 8080;  //default port apparently
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
let cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

app.set('view engine', 'ejs'); //setting ejs as the view engine after installing ejs


const users = {               //Users database
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};

const urlDatabase = {                                                     //each key is the short url created by the user in the userId
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
};

// GET ROUTES

app.get("/", (req, res) => {
  const user = getLoggedInUser(req, users);       // find the user in the database to direct him to the urlspage
  if (user) {
    let templateVars = { urls: urlsForUser(user.id, urlDatabase), user: user };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');                        //redirects the users to the login page if not logged in yet or to the
  }
  // res.send('Hello!');                           //initially this was the message on this page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {              //allows only logged in users to create a new url
  const user = getLoggedInUser(req, users);
  if (user) {
    let templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');                     //otherwise the user will be redirected to the login page
  }
});

/* These two routes were initially added to test the basic syntax of routes and how to send a message to users

app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
*/

app.get('/urls', (req, res) => {
  const user = getLoggedInUser(req, users);
  if (user) {
    let templateVars = { urls: urlsForUser(user.id, urlDatabase), user: user };       //Finds the user from the data base and passes
    res.render('urls_index', templateVars);           //user specific users to templatevars to be rendered and presented to the user
  } else {
    res.redirect('/login');                          //Users not logged in will be redirected to the login page
  }
});

app.get('/u/:shortURL', (req, res) => {                       //using the shortened url, the link redirects the user to the page
  const longURL = urlDatabase[req.params.shortURL].longURL;   //to the longurl
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = getLoggedInUser(req, users);
  if (user) {         //Finds the user from the data base and passes
    let shortURL = '';
    let urls = urlsForUser(user.id, urlDatabase);  //Gets a list of urls for the user
    for (const url in urls) {            //sets the short url to the key of the object found
      shortURL = url;
    }
    //sets user specific data to templatevars to be rendered and presented to the user
    let templateVars = { urls: urls, shortURL: shortURL, longURL: shortURL.longURL, user: user };
    res.render('urls_show', templateVars);
  } else {                               //Users not logged in will be redirected to the login page
    res.redirect('/login');
  }
});

/*The previous format used for accessing urls >> Not functional now as it needed filtering
const userId = req.session.userId;
const user = users[userId];
let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
res.render('urls_show', templateVars);
  });
*/

app.get('/register', (req, res) => {        //Route for users to sign up
  const user = users[req.session.userId];
  if (user) {                               //If the user is already logged in, they will be redirected to urls page
    res.redirect('/urls');
  } else {
    let templateVars = { user };
    res.render('register', templateVars);   //New users will be redirected to the sign up page
  }
});

app.get('/login', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (user) {                               //logged in users cannot access the login page again and will be redirected
    res.redirect('/urls');                  // to urls page
  } else {
    let templateVars = { user };
    res.render('login', templateVars);      //if the user is not logged in, they will be presented will the login form
  }
});

// POST ROUTES

app.post('/urls', (req, res) => {
  let longUrl = req.body.longURL;
  if (!longUrl.includes('http')) {     //making sure that the address includes http at the beginning
    longUrl = 'http://' + longUrl;
  }
  let shortURL = generateRandomString();      //creates a random string which is the shortlurl
  urlDatabase[shortURL] = { longURL: longUrl, userId: req.session.userId };   //short and long url will be associated with 
  res.redirect(`/urls`);                                                      //the user's ID
});


app.post('/urls/:shortURL/delete', (req, res) => {            //Logged in users can view only their urls and can delete 
  delete urlDatabase[req.params.shortURL];                    // the urls using the delete button 
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  //users can edit their urls and associate the short one to a different longurl

  // console.log(urlDatabase);      //it was to check if the new longurl was added to the database
  const shortURL = req.params.shortURL;
  let longURL = req.body.url;
  if (!longURL.includes('http')) {     //making sure that the address includes http at the beginning
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {          //verifies user's email and password through authenticateUser function
  const { email, password } = req.body;
  let user = authenticateUser(email, password, users);
  if (user) {
    req.session.userId = user.id;
    res.redirect('/urls');
  } else {                                //Send a 403 status code to the user if the password is wrong
    res.send(403);
  }
});

app.post('/logout', (req, res) => {     //logs out the user and clears the session
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  let randomId = generateRandomString();          //creates a random id for the new user
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);     //hashes the password and stores it in the data base
  // console.log(hashedPassword);
  if (email.length < 1 || password < 1) {       //checks the email and password input boxes to not be empty
    res.send(404);                              //Sends and error if the inout boxes are left empty
    return;
  }
  if (existingUser(email, users)) {              //if an existing user tries to sign up, they get a message telling them 
    res.send('You are already registered. Please log in.');     //to sign in
    return;
  }
  users[randomId] = { id: randomId, email: email, password: hashedPassword };
  req.session.userId = randomId;
  res.redirect('/urls');                        //Once the user is registers, they are redirected to the urls page
});

app.listen(PORT, () => {                      
  console.log(`Example app listening on port ${PORT}, probably?`);
});
