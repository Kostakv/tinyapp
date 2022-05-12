const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
var cookieSession = require('cookie-session')

const bodyParser = require("body-parser");
const res = require("express/lib/response");
//app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: 'ABC/@432cuas42/as',

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))




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

function checkURL(url){
  for (const key in urlDatabase) {
    if (url === key){
      return true;
    }
  }
  return false;
}


function urlsForUser(id, url){
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID && url === key){
      return true;
    }
  }
  return false;
}


function checkEmail(email){
  
  for (const user in users){
    if (users[user].email == email){
      return true;
    }
  }
  return false; 
}

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
  const templateVars = { urls: urlDatabase, users: users, userID: req.session.user_id  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id === undefined){
    res.status(400).send('Error, access denied!')
  } else {
  console.log(req.body); 
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
  console.log(urlDatabase)
  //urlDatabase[shortURL] = longURL;
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
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, users: users, userID: req.session.user_id, urls: urlDatabase, access: access };
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

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlsForUser(req.session.user_id,req.params.shortURL)){
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
  } else {
    res.status(400).send("You do not have permission to delete this URL")
  }

});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlsForUser(req.session.user_id,req.params.shortURL)){
  urlDatabase[req.params.shortURL] = {longURL: req.body.newURL, userID: req.session.user_id}
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users, userID: req.session.user_id};
  res.render("urls_show",templateVars)
  } else {
    res.status(400).send("You do not have permission to edit this URL")
  }
});

app.post("/urls/:shortURL/newURL", (req, res) => {

    const longURL = req.body.newURL;
    urlDatabase[req.params.shortURL] = {longURL: longURL, userID: req.session.user_id};
    res.redirect("/urls");
  
});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  if (checkEmail(email) && checkPassword(password, email)){
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

app.post("/logout", (req, res) => {
  res.clearCookie('userID')
  res.redirect("/urls")
  
});

app.post("/register", (req, res) => {

  const ranID = generateRandomString();

  if (req.body.email == '' || req.body.password == '' || checkEmail(req.body.email)){
    res.status(400).send('Status: Bad Request')
  }
  else {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[ranID] = {id: ranID, email: req.body.email, password: hashedPassword}
  req.session.user_id = ranID;
  console.log(req.session.user_id);

  req.session.email = req.body.email;
  req.session.password = hashedPassword;
  res.redirect("/urls");
  }
  
});











