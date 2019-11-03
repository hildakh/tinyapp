const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    console.log(user, expectedOutput);
    assert(user, expectedOutput);// Write your assert statement here
  });
});

describe('getUserByEmail', function() {
  it('should return undefined if the email is not found in the usersDatabase', function() {
    const user = getUserByEmail('hildakhl@lhl.com', testUsers);
    const expectedOutput = undefined;
    console.log(user, expectedOutput);
    assert(user, expectedOutput);// Write your assert statement here
  });
});