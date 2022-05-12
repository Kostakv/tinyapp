function checkEmail(email,users){
  
  for (const user in users){
    if (users[user].email == email){
      return true;
    }
  }
  return false; 
}

module.exports = {checkEmail}