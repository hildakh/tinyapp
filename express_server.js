const express = require('express');
const app = express();
const PORT = 8080;  //default port apparently
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs'); //setting ejs as the view engine after installing ejs

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
  let templateVars = {
    username: req.cookies["username"],
  };
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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/urls/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})
//Do not need the following anymore as we used a different post above
// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//Generates a string of six random alphanumeric characters
function generateRandomString() {
  let randomAlphNum = Math.random().toString(36).substring(6);
  return randomAlphNum;
}