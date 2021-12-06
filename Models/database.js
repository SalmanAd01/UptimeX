const Sequelize = require('sequelize');
require('dotenv').config()
const sequelize = require("./my_sequelize")
var User = sequelize.define('userinfodb', {
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
  }
}, {
  freezeTableName: true,
});


User.sync().then(function () {
  console.log("Created");
});


module.exports = User;