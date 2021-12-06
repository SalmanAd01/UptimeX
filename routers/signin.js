const express = require('express')
const router = express.Router()
const { checkAuthenticated } = require('../public/auth')
const { common_render } = require('../controllers/controller')
const User = require('../Models/database')
const crypto = require("crypto");
const smtpTransport = require('../public/smtpconfig')
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
router.get('/', checkAuthenticated, common_render)
router.post('/', checkAuthenticated, async (req, res) => {
    try {
        username = req.body.usnl;
        email = req.body.eml;
        password = req.body.psdl;
        const hash = crypto
            .pbkdf2Sync(password, process.env.SALT, 1000, 64, "sha256")
            .toString("hex");
        console.log(username, email, password);
        const user = await User.findOne({
            where: {
                [Op.or]: [{ username: username }, { email: email }],
            },
        });
        if (user) {
            req.flash("info", "User Already Exsist");
            return res.redirect("/");
        } else {
            const token = jwt.sign(
                { email, hash, username },
                process.env.JWT_ACC_ACTIVATE,
                { expiresIn: "20m" }
            );
            host = req.get("host");
            mailOptions = {
                to: email,
                subject: "Please confirm your Email account",
                html: `
              <h2>Please Click The Link</h2>
              <p>http://${host}/authentication/activate/${token}</p>
              `,
            };
            console.log(mailOptions);
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    return res.json({
                        error: "error Occured",
                    });
                } else {
                    return res.json({
                        message: "Email Sent",
                    });
                }
            });
            req.flash("info", "Check Mail For Authentication");
            return res.redirect("/");
        }
    } catch (error) {
        req.flash("info", "Some Error Occured");
        console.log(error);
        return res.redirect("/");
    }
});
module.exports = router