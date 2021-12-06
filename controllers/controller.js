const jwt = require("jsonwebtoken");
const User = require("../Models/database");
const Monitors = require("../Models/Monitors");
const smtpTransport = require("../public/smtpconfig")
const activateAccount = async (req, res, next) => {
  try {
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
          const { email, hash, username } = decodedToken;
          console.log(email, hash, username);
          const user = await User.findOne({
            where: { username: username, email: email },
          });
          if (user === null) {
            console.log("---->>> ", user);
            try {
              const new_user_add = await User.create({
                username: username,
                email: email,
                password: hash,
              });
              console.log(new_user_add instanceof User);
              req.flash("info", "Authentication Successfull");
              return res.redirect("/");
            } catch (error) {
              console.log(error);
              req.flash("info", "Erro Occured");
              return res.redirect("/");
            }
          } else {
            console.log("---->>> ", user);
            req.flash("info", "User Already Exsist");
            return res.redirect("/");
          }
        }
      );
    }
  }
  catch (err) {
    return res.json({ msg: "Error Happens" });
  }
};
const contact_mail = (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log(name, email, subject, message);
    mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: name + " : " + subject,
      body: message,
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        return res.json({
          error: error,
        });
      } else {
        return res.json({ message: "mail sent" });
      }
    });
    req.flash('contact', 'Mail Sent Successfully')
    return res.redirect('/')
  }
  catch (err) {
    req.flash('contact', 'Some Error Occured')
    return res.redirect('/')
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { emailforget } = req.body;
    console.log(emailforget);
    const user = await User.findOne({
      where: { email: emailforget },
    });
    if (!user) {
      req.flash("infos", "User Not Exsist");
      return res.redirect("/");
    }
    const token = jwt.sign({ emailforget }, process.env.JWT_ACC_ACTIVATE, {
      expiresIn: "20m",
    });
    host = req.get("host");
    mailOptions = {
      to: emailforget,
      subject: "Please confirm your Email account",
      html: `
      <h2>Please Click The Link</h2>
      <p>http://${host}/authentication/changepassword/${token}</p>
      `,
    };
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        return res.json({
          error: "error Occur",
        });
      } else {
        return res.json({
          message: "Email Sent",
        });
      }
    });
    req.flash("infos", "Check Mail For Authentication");
    return res.redirect("/");
  }
  catch (err) {
    req.flash("infos", "Some Error occurred");
    return res.redirect("/");

  }
};

const Dashboard = async (req, res) => {
  try {
    const monitors = await Monitors.findAll({
      where: {
        userid: req.user
      },
      order: [['id', 'ASC']]
    })
    return res.render('dashboard', { monitors: monitors });
  }
  catch (err) {
    return res.render('dashboard', { monitors: false });
  }
}
const common_render = (req, res) => {
  return res.render('index')
}
const log_out = (req, res) => {
  req.logout();
  return res.render("index");
}
module.exports = {
  activateAccount,
  contact_mail,
  forgotPassword,
  Dashboard,
  common_render,
  log_out
};
