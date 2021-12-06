const express = require('express')
const router = express.Router()
const { common_render } = require('../controllers/controller')
const passport = require("passport");
const { checkAuthenticated } = require('../public/auth')
router.get('/', checkAuthenticated, common_render)
router.post("/", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
    failureFlash: true
}));
module.exports = router