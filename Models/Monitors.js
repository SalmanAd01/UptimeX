const Sequelize = require('sequelize');
require('dotenv').config()
const sequelize = require("./my_sequelize")
var Monitors = sequelize.define('usermonitorinfodb', {
  userid: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'userinfo',
      key: 'id'
    }
  },
  url: {
    type: Sequelize.STRING,
    validate: {
      isUrl: true,
    },
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isblock: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    },
    allowNull: false
  }
}, {
  freezeTableName: true,
})
Monitors.sync().then(function () {
  console.log("Created");
});
module.exports = Monitors;