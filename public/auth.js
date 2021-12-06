function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('infos', 'Singup First');
    return res.redirect("/");
}

module.exports = {
    checkNotAuthenticated,
    checkAuthenticated
}