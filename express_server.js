const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['malimalihome']
}));
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
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
  if(req.session.user_ID){
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//login
app.post("/login", (req, res) => {
  if (!doesEmailExist(req.body.email)){
    res.status(403).redirect('/urls');
  } else {
    //check for password
    if (bcrypt.compareSync(req.body.password, users[userID].password)){
      req.session.user_ID = userID;
      res.redirect('/urls');
    } else {
    res.status(403).redirect('/login');
    }
  }
});

//login form
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_ID]};
  res.render("urls_login", templateVars);
});

//logout
app.post("/logout", (req, res) => {
  req.session.user_ID = null;
  res.redirect('/login');
});

//go to register page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_ID]};
  res.render("urls_register", templateVars);
});

//submit register
app.post("/register", (req, res) => {
  if (doesEmailExist(req.body.email)){
    res.status(400).send('Duplicated email');
  } else if (req.body.email == ' ' || req.body.password == ''){
    res.status(400).send('Incomplete Information');
  } else {
    const realPw = req.body.password;
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(realPw, 10)
    };
    req.session.user_ID = userID;
    console.log(users);
    res.redirect("/urls");
  }
});

//page for all urls
app.get("/urls", (req, res) => {
  const currentUser = req.session.user_ID;
  const templateVars = { urls: urlsForUser(currentUser), user: users[currentUser]};
  res.render("urls_index", templateVars);
});
//create form
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_ID]};
  if (!req.session.user_ID){
    res.redirect('/login');
  } else {
  res.render("urls_new", templateVars);
}
});
//create short url
app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: '', userID: ''};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_ID;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//redirect to real site
app.get("/u/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL].longURL;
  if (!long){
    res.send("Does not exist.");
  } else {
    res.redirect(long);
  }
  console.log("status code: ",res.statusCode);
});
//to the indivodual short url page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    currentUser: req.session.user_ID,
    userOfURL: urlDatabase[shortURL].userID,
    user: users[req.session.user_ID]
  };
  res.render("urls_show", templateVars);
});
//delete url
app.post("/urls/:shortURL/delete", (req, res) =>{
  if(req.session.user_ID == urlDatabase[req.params.shortURL].userID){
  let shortURL = req.params.shortURL;
  console.log("deleted");
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  }
});
//update url
app.post("/urls/:shortURL/edit", (req, res) =>{
  if(req.session.user_ID == urlDatabase[req.params.shortURL].userID){
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
  return;
  }
});

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


function doesEmailExist(newemail) {
  let doesEmailExist = false;
  for ( userID in users) {
    if (users[userID].email && users[userID].email == newemail) {
     doesEmailExist = true;
     break;
    }
  // let emailArray = [];
  // for (user in users){
  //   emailArray.push(users[user].email);
  // }
  //   if ( newemail && emailArray.includes(newemail)){
  //     return 'exist';
  //   } return 'new';
  }
  return doesEmailExist;
}

function urlsForUser(id) {
  let userURL = {};
  for ( data in urlDatabase){
    if (urlDatabase[data].userID == id){
      userURL[data] = urlDatabase[data].longURL;
    }
  } return userURL;
}