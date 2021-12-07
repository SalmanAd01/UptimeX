const express = require('express');
const app = express();
const WSServer = require('ws').Server;
let server = require('http').createServer();
const { activateAccount, contact_mail, forgotPassword, Dashboard, common_render, log_out } = require('./controllers/controller');
const { checkAuthenticated, checkNotAuthenticated } = require('./public/auth')
require('dotenv').config();
const path = require('path');
const cors = require('cors');
var flash = require('express-flash');
var session = require('express-session');
const passport = require("passport");
const monitor = require('./routers/monitor')
const changePassword = require('./routers/changePassword')
const signin = require('./routers/signin')
const signup = require('./routers/signup')
const { registerProgressEvent } = require('./public/websocket')
const initializePassport = require("./public/passportConfig");
initializePassport(passport);
app.use(express.json())
app.set('view engine', 'hbs');
app.use(cors());
app.use(session({
  secret: process.env.JWT_ACC_ACTIVATE,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.resolve(__dirname, './static')))
app.use(express.urlencoded({ extended: false }))
app.use('/monitor', monitor);
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/authentication/changepassword', changePassword);
const port = process.env.PORT || 5000
let wss = new WSServer({ server });
server.on('request', app);
wss.on('connection', function connection(ws) {
  ws.on("message", function message(rawData) {
    const data = JSON.parse(rawData);
    if (data.type === "progress") {
      registerProgressEvent(ws);
    }
  });
});

app.get('/', checkAuthenticated, common_render)
app.get("/logout", log_out);
app.get('/authentication/activate/:token', activateAccount)
app.get('/dashboard', checkNotAuthenticated, Dashboard)
app.post("/contact", contact_mail)
app.post('/reset_link', forgotPassword)
app.get('*', checkAuthenticated, common_render);

server.listen(port, function () {
  console.log(`http://localhost:${port}`);
});
