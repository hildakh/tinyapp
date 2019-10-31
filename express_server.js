const express = require('express');
const app = express();
const PORT = 8080;  //default port apparently
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
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
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies["userId"]
  const user = users[userId];
  let templateVars = { 'user': user };
  res.render('urls_new', templateVars);

});

//If you want to use curl to see the html, just open another terminal. You will need the server running for it to actually work
app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

//This one below was to show that variables inside requests are not accessible from other requests
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.get('/urls', (req, res) => {
  let user = undefined;
  if(req.cookies['userId']) {
  const userId = req.cookies["userId"]
  user = users[userId];
  } 
  let templateVars = { urls: urlDatabase, 'user': user };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  let longUrl = req.body.longURL;
  if (!longUrl.includes('http')) {     //making sure that the address includes http at the beginning 
    longUrl = 'http://' + longUrl;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longUrl;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.cookies["userId"]
  const user = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 'user': user };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  // console.log(req.params.shortURL);
  res.redirect(longURL);
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

app.post('/urls/login', (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      if (user.password === password) {
        res.cookie('userId', userId);
        res.redirect('/urls');
        // req.session.userId = userId;
        // res.redirect('/');
      }
      res.send('error');
    }
    res.send(`User doesn't exist. Please sign up.`);
  }
});

app.post('/urls/logout', (req, res) => {

  // res.clearCookie('userId');
  res.cookie('userId', '');
  res.redirect('/urls');
})

//Do not need the following anymore as we used a different post above
// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });

app.get('/register', (req, res) => {  //check why te header and templatevars are needed
  const userId = req.cookies["userId"]
  const user = users[userId];
  let templateVars = { 'user': user };
  //needed bcz of the header
  res.render('register', templateVars);

});

app.post('/register', (req, res) => {
  let randomId = generateRandomString();
  var email = req.body.email;
  var password = req.body.password;
  users[randomId] = { id: randomId, email: email, password: password }
  // console.log(email, password);      //users.randomId won't work as that key does not exist.
  // console.log(users);
  if (email.length < 1 || password < 1) {
    res.send(404);
  }
  res.redirect('/urls');
  // res.redirect('urls');
})

app.get ('/login', (req, res) => {
  const userId = req.cookies["userId"]
  const user = users[userId];
  let templateVars = { 'user': user };
  res.render('login', templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//Generates a string of six random alphanumeric characters
function generateRandomString() {
  let randomAlphNum = Math.random().toString(36).substring(6);
  return randomAlphNum;
}