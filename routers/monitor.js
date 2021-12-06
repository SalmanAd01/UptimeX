const express = require('express')
const router = express.Router()
const Monitors = require("../Models/Monitors");
const fetch = require("node-fetch");
const { timeout } = require("../public/websocket")
const { checkNotAuthenticated } = require('../public/auth')
router.post("/", checkNotAuthenticated, async (req, res) => {
    const { name1, url1 } = req.body;
    console.log(name1, url1);
    try {
        const response = await fetch(url1)
        const get_status = await response.ok
        console.log(get_status);
        if (get_status) {
            timeout('Request Send Successfully');
            timeout('Scrapping Email');
            const response = await fetch(url1)
            const email_send = await response.text();
            var em = email_send.match((/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/gi))
            var getemail;
            try {
                getemail = em[0];
                timeout('Email Scrap Successfully');
            }
            catch (e) {
                getemail = "notfound@gmail.com";
                timeout('Email Scrap Fail');
            }
            console.log(name1, url1);
            const my_monitor = await Monitors.create({
                userid: req.user,
                url: url1,
                name: name1,
                email: getemail
            });
            console.log(my_monitor);
            timeout('Monitor Added Successfully')

            req.flash("info", "Monitor Added Successfully");
            return res.redirect("/dashboard");
        }
    } catch (err) {
        timeout('URL Not Found')
        console.log("catch", err);
        req.flash("info", "Enter The Correct URL");
        return res.redirect("/dashboard");
    }
})
router.delete("/", checkNotAuthenticated, async (req, res) => {
    try {
        await Monitors.destroy({
            where: {
                id: req.body.data,
                userid: req.user
            }
        })
        return res.send("Monitor Deleted Successfully")
    }
    catch (err) {
        return res.send("Some Error occurred")
    }
})
router.put("/", checkNotAuthenticated, async (req, res) => {
    try {
        const id = req.body.data;
        const my_monitor = await Monitors.update({ isblock: false }, { where: { id: id, userid: req.user } })
        return res.send("Monitor Unblock Successfully");
    }
    catch (err) {
        return res.send("Erorr Ocurr")
    }
})
router.post("/edit", checkNotAuthenticated, async (req, res) => {
    try {
        const { id, name, email, url } = req.body;
        const response = await fetch(url)
        const get_status = await response.ok
        console.log(get_status);
        if (get_status) {
            timeout('Request Send Successfully');
            try {
                const my_monitor = await Monitors.update({ name: name, email: email, url: url }, { where: { id: id, userid: req.user } })
                timeout('Monitor Edit Successfully')
                return res.json({
                    msg: "Monitor Edit Successfully",
                });
            }
            catch (err) {
                timeout('Email is not Correct')
                console.log("--->>> ", err);
                return res.json({
                    msg: "Email is not Correct",
                });
            };
        }
    }
    catch (err) {
        timeout('URL Not Found');
        console.log(err);
        return res.json({
            msg: "URL Not Found",
        });
    }
});

module.exports = router