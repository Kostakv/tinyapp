const { assert } = require('chai');

const { getUserByEmail, checkEmail } = require('../helper.js');

const testUsers = {
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

describe('checkEmail', function() {
  it('should return true if valid user', function() {
    const user = checkEmail("user@example.com", testUsers)
    assert.equal(user,true)
    
  });
});
