function checkEmail(email,users){
  
  for (const user in users){
    if (users[user].email == email){
      return true;
    }
  }
  return false; 
}

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

module.exports = {checkEmail, generateRandomString}