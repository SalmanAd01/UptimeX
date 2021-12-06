const express = require('express')
const router = express.Router()
const User = require('../Models/database')
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

router.get('/:token', async (req, res, next) => {
    const token = req.params.token;
    console.log(token);
    if (token) {
        jwt.verify(
            token,
            process.env.JWT_ACC_ACTIVATE,
            async (err, decodedToken) => {
                if (err) {
                    return res.json({ error: "Incorrect or Expired token" });
                }
                const { emailforget } = decodedToken;
                console.log(emailforget);
                const user = await User.findOne({ where: { email: emailforget } });
                if (user != null) {
                    console.log("---->>> ", user);
                    try {
                        return res.render("forgot_password", { token: token });
                    } catch (error) {
                        console.log(error);
                        return res.json({ error: `Already Exsist ${error}` });
                    }
                } else {
                    console.log("---->>> ", user);
                    return res.json({ error: "Not Exsist" });
                }
            }
        );
    } else {
        return res.json({ error: "Error Happens" });
    }
});
router.post('/:token', async (req, res, next) => {
    const token = req.params.token;
    console.log(token);
    if (token) {
        jwt.verify(
            token,
            process.env.JWT_ACC_ACTIVATE,
            async (err, decodedToken) => {
                if (err) {
                    return res.status(400).json({ error: "Incorrect or Expired token" });
                }
                const { emailforget } = decodedToken;
                console.log(emailforget);
                const user = await User.findOne({ where: { email: emailforget } });
                if (user != null) {
                    console.log("---->>> ", user);
                    try {
                        const { password1, password2 } = req.body;
                        if (password1 === password2) {
                            console.log(password1, password2);
                            const hash = crypto
                                .pbkdf2Sync(password1, process.env.SALT, 1000, 64, "sha256")
                                .toString("hex");
                            try {
                                const change_pass = await User.update({ password: hash }, { where: { email: emailforget } })
                                req.flash("infos", "Password Change Successfully");
                                return res.redirect("/");
                            }
                            catch (err) {
                                req.flash("infos", "Erro Occured");
                                return res.redirect("/");
                            };
                        } else {
                            console.log(password1, password2);
                            req.flash("info", "Password Are Not Same");
                            return res.render("forgot_password", { token: token });
                        }
                    } catch (error) {
                        console.log(error);
                        return res.status(400).json({ error: `Erro Occured` });
                    }
                } else {
                    console.log("---->>> ", user);
                    return res.status(400).json({ error: "You Need To Sign In First!" });
                }
            }
        );
    } else {
        return res.json({ error: "Error Happens" });
    }
});

module.exports = router