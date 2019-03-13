const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

//login
app.post("/login", (req, res) => {
  if (emailValidate(req.body.email) == 'new'){
    res.status(403);
  } else {
  for ( userID in users) {
    if (users[userID].email && users[userID].email == req.body.email) {
      if (req.body.password == users[userID].password){
      res.cookie('user_ID', userID);
      } else {
      res.status(403).send('password incorrect');
      }
    }
   }
  }
  res.redirect('/urls');
});

//login form
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('urls');
});

//go to register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//submit register
app.post("/register", (req, res) => {
  if (emailValidate(req.body.email) == 'exist'){
    res.status(400).send('Duplicated email');
  } else if (req.body.email == ' ' || req.body.password == ''){
    res.status(400).send('Incomplete Information');
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('userID', userID);
    console.log(users);
    res.redirect("/urls");
  }
});

//page for all urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_ID]};
  res.render("urls_index", templateVars);
});
//create form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//create short url
app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//redirect to real site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL){
    res.send("Does not exist.");
  } else {
    res.redirect(longURL);
  }
  console.log("status code: ",res.statusCode);
});
//to the indivodual short url page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies.user_ID]
  };
  res.render("urls_show", templateVars);
});
//delete url
app.post("/urls/:shortURL/delete", (req, res) =>{
  let shortURL = req.params.shortURL;
  console.log("deleted");
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
//update url
app.post("/urls/:shortURL/edit", (req, res) =>{
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let string = '';
  for (let i = 0; i < 6; i++){
    let random = Math.floor(Math.random() * chars.length);
    string += chars[random];
  } return string;
}

function emailValidate(newemail) {
  // for ( userID in users) {
  //   if (users[userID].email && users[userID].email == newemail) {
  //    return 'exist';
  //   } return 'new';
  let emailArray = [];
  for (user in users){
    emailArray.push(users[user].email);
  }
    if ( newemail && emailArray.includes(newemail)){
      return 'exist';
    } return 'new';
  // }
}

