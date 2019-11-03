const getLoggedInUser = require('./helpers');
const urlsForUser = require('./helpers');
const authenticateUser = require('./helpers');
const existingUser = require('./helpers');
const generateRandomString = require('./helpers');
const getUserByEmail = require('./helpers');
const express = require('express');
const app = express();
const PORT = 8080;  //default port apparently
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))
app.set('view engine', 'ejs'); //setting ejs as the view engine after installing ejs

const users = {
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
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
};

// GET ROUTES

app.get("/", (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const user = getLoggedInUser(req);
  if (user) {
    let templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/urls', (req, res) => {
  const user = getLoggedInUser(req);
  if (user) {
    let templateVars = { urls: urlsForUser(user, urlDatabase), user: user };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const user = users[req.session.userId];
  if (user) {
    res.redirect('/urls');
  } else {
    let templateVars = { user };
    res.render('register', templateVars)
  }
});

app.get('/login', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (user) {
    res.redirect('/urls');
  } else {
    let templateVars = { user };
    res.render('login', templateVars)
  }
});

// POST ROUTES

app.post('/urls', (req, res) => {
  let longUrl = req.body.longURL;
  if (!longUrl.includes('http')) {     //making sure that the address includes http at the beginning 
    longUrl = 'http://' + longUrl;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longUrl, userId: req.session.userId };
  res.redirect(`/urls`);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  // console.log(urlDatabase);      //it was to check if the new longurl was added to the database
  const shortURL = req.params.shortURL;
  let longURL = req.body.url;
  if (!longURL.includes('http')) {     //making sure that the address includes http at the beginning 
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user = authenticateUser(email, password);
  if (user) {
    req.session.userId = user.id;
    res.redirect('/urls');
  } else {
    res.send(403);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
})

app.post('/register', (req, res) => {
  let randomId = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log(hashedPassword);
  if (email.length < 1 || password < 1) {
    res.send(404);
    return;
  }
  if (existingUser(email)) {
    res.send('You are already registered. Please log in.');
    return;
  }
  users[randomId] = { id: randomId, email: email, password: hashedPassword };
  req.session.userId = randomId;
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}, probably?`);
});
