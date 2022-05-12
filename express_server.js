const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
var cookieSession = require('cookie-session')
const helper = require('./helper')

const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['ABC/@432cuas42/as'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



//Function to generate random string for new tinyURL's
function generateRandomString() {
  var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 7; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
      charactersLength));
   }
   return result;
}




app.set("view engine", "ejs");


const users = { 

   
}

//URL database, uses userID to validate which user has access to each longURL
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "master"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

//Function to check if the URL is in the urlDatabase or not.
function checkURL(url){
  for (const key in urlDatabase) {
    if (url === key){
      return true;
    }
  }
  return false;
}

//Function that checks if the URL belongs to a specific user.
function urlsForUser(id, url){
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID && url === key){
      return true;
    }
  }
  return false;
}


//Checks the password with the email passed. returns true or false
function checkPassword(password,email){
  for (const user in users){
    if (bcrypt.compareSync(password,users[user].password) && users[user].email === email){
      return true;
    }
  }
  return false; 
}



app.get("/urls/new", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users: users, userID: req.session.user_id };
  if (req.session.user_id === undefined){
    res.redirect("/login")
  } else {
  res.render("urls_new",templateVars);
  }
  
});

app.get("/register", (req, res) => {
  res.render ("register")
});


app.get("/login", (req, res) => {
  res.render ("login")
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, users: users, userID: req.session.user_id };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id === undefined){
    res.status(400).send('Error, access denied!')
  } else {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
  res.redirect("/urls"); 
  }        
});

app.get("/urls/:shortURL", (req, res) => {
  let access = true;
  if (checkURL(req.params.shortURL)){
    if (urlsForUser(req.session.user_id,req.params.shortURL)){
      access = true;
    }else {
      access = false;
    }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users, userID: req.session.user_id, urls: urlDatabase, access: access };
  res.render("urls_show", templateVars);
  
    
  } else {
    res.status(400).send("Short URL does not exist!")
  }
});

app.get("/u/:shortURL", (req, res) => {
  let error = true;
  for (const key in urlDatabase) {
    if (req.params.shortURL === key){
        error = false;
        const longURL = urlDatabase[req.params.shortURL].longURL
        res.redirect(longURL);
    }
  }
  if (error){
    res.status(400).send('Short URL does not exist...')
  }
  
});
// Delete post request, cannot delete if access is denied.
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlsForUser(req.session.user_id,req.params.shortURL)){
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
  } else {
    res.status(400).send("You do not have permission to delete this URL")
  }

});

// Edit URL post request, checks if url is in database along with who owns the URL, can't edit if no permission. 
app.post("/urls/:shortURL/edit", (req, res) => {
  let access = false;
  let newURL = req.body.newURL;
  if (urlsForUser(req.session.user_id,req.params.shortURL)){
    access = true;
  urlDatabase[req.params.shortURL] = {longURL: newURL, userID: req.session.user_id}
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users, userID: req.session.user_id, access: access};
  res.render("urls_show",templateVars)
  } else {
    res.status(400).send("You do not have permission to edit this URL")
  }
});

//post request for new URL, assigns url to the urlDatabase, assigns who registered the new URL
app.post("/urls/:shortURL/newURL", (req, res) => {

    const longURL = req.body.newURL;
    urlDatabase[req.params.shortURL] = {longURL: longURL, userID: req.session.user_id};
    res.redirect("/urls");
  
});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  if (helper.checkEmail(email,users) && checkPassword(password, email)){ // Checks if email and password match, both must be TRUE
    for (const user in users){
      if (users[user].email == email){
        req.session.user_id = user;
      }
    }
    res.redirect("/urls")
  } else {
    res.status(400).send('Incorrect email or password')
  }
  
  

  
});
// Logout post request, clears user_id cookie.
app.post("/logout", (req, res) => {
  req.session.user_id = undefined;
  res.redirect("/urls")
  
});

//Post to register an account.
app.post("/register", (req, res) => {

  const ranID = generateRandomString();
  // Checks if email is in use, along with if bad password or bad email entered, if any fail, wont pass.
  if (req.body.email == '' || req.body.password == '' || helper.checkEmail(req.body.email,users)){ 
    res.status(400).send('Status: Bad Request')
  }
  else {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10); // Hashes the password.
  users[ranID] = {id: ranID, email: req.body.email, password: hashedPassword} // Generates new user passed on passed result.
  req.session.user_id = ranID;
  res.redirect("/urls");
  }
  
  
});
