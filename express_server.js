const express = require('express');
const app = express();
const PORT = 8080;  //default port apparently
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}))
app.set('view engine', 'ejs'); //setting ejs as the view engine after installing ejs


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GET ROUTES

app.get("/", (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  let templateVars = { user };
  res.render('urls_new', templateVars);
});

app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/urls', (req, res) => {
  let user = undefined;
  const { userId } = req.session;
  if (userId) {
    user = users[userId];
  }
  let templateVars = { urls: urlDatabase, 'user': user };
  res.render("urls_index", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 'user': user };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const userId = req.session.userId;
  if(req.session.userId) {
    res.redirect('/urls');
  } else {
  const user = users[userId];
  let templateVars = { user };
  res.render('register', templateVars)
  }
});

app.get('/login', (req, res) => {
  const userId = req.session.userId;
  if(req.session.userId) {
    res.redirect('/urls');
  } else {
  const user = users[userId];
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
  urlDatabase[shortURL] = longUrl;
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
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

function authenticateUser(email, password) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password) {
      return users[user];
    }
  }
}

function existingUser(email) {
  for (let user in users) {
    if (users[user].email === email)
      return true;
  }
  return false;
}
console.log(existingUser('12345@yahoo.com'));
console.log(existingUser('user2@example.com'));

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
  // res.cookie('userId', '');
  // res.redirect('/urls');
})

app.post('/register', (req, res) => {
  let randomId = generateRandomString();
  const { email, password } = req.body;
  if (email.length < 1 || password < 1) {
    res.send(404);
    return;
  }
  if(existingUser(email)) {
    res.send('You are already registered. Please log in.');
    return;
  }
  users[randomId] = { id: randomId, email: email, password: password }
  console.log(randomId, email, password);
  req.session.userId = randomId;
  res.redirect('/urls');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//Generates a string of six random alphanumeric characters
function generateRandomString() {
  let randomAlphNum = Math.random().toString(36).substring(6);
  return randomAlphNum;
}