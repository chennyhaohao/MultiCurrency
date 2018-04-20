var express = require('express');
var crypto = require('crypto');
var mysql = require('mysql');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var router = express.Router();
var controller = require('../controller/template.js');
var con = require('./db.js');
var Auth = require('./Authentication.js');
var Mailer = require('nodemailer');
var url = require('url');

process.env.JWT_SECRET = "58F42AF9AC6B673724A6A67BEE39B";

const transporter = Mailer.createTransport({
    host: 'mail.kreniecki.hekko24.pl',
    port: 465,
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'test@kreniecki.hekko24.pl',
        pass: 'test'
    }
})

function returnState(status = false, data = {}, error = null) {
    return { status: status, data: data, error: error };
}

function roleGranted(req, roles) {
    if (roles.includes(req.user.role)) {
        return returnState(true);
    } else {
        return returnState(false, null, { msg: "You don't have permissions" });
    }
}
/*
const dbParams = {
    host: 's69.hekko.pl',
    user: 'polkomwq_mc',
    password: 'hvrS9N0H',
    database: 'polkomwq_mc',
}

var con = mysql.createConnection(dbParams);
*/

var clientHost = "localhost:3000";

router.get('/', Auth.ensureAuthorized, function (req, res, next) {
    var role = roleGranted(req, ['user', 'admin']);
    if (role.status) {
        res.json({ status: "done" });
    } else {
        res.status(400).json(role);
    }
});

router.post('/login', function (req, res, next) {
    let username = req.body.login;
    let password = Auth.sha256(req.body.password);

    con.query("SELECT * FROM users WHERE ?", { username: username }, function (err, result) {
        if (err) throw err;

        if (result.length == 0 || password !== result[0].password) {
            res.json(returnState(false, null, { msg: "Wrong username or password!" }));
            return;
        } else {
            result = result[0];
            if (result.activated === 0) {
                res.json(returnState(false, null, { msg: "Before login you must activate account. Please check email." }));
                return;
            } else {
                const token = Auth.encodeToken(result);

                if (password === result.password) {
                    res.json(returnState(true, { token: token, user: result }));
                } else {
                    res.json(returnState(false, null, { msg: "Wrong username or password!" }));
                }
            }
        }
    });
});

router.post('/register', function (req, res, next) {

    con.query("SELECT COUNT(*) AS thisSameUsers FROM users WHERE username=? OR email=?", [req.body.username, req.body.email], function (err, result) {
        if (err) throw err;
        if (result[0].thisSameUsers === 0) {
            let password = Auth.sha256(req.body.password);
            let key = Auth.sha256(new Date().toString()).replace(/\//g, ' ');
            con.query("INSERT INTO users (username, email, password, token) VALUES (?, ?, ?, ?)", [req.body.username, req.body.email, password, key], function (err, result) {
                if (err) throw err;

                var mailOptions = {
                    from: 'polkom21@gmail.com',
                    to: req.body.email,
                    subject: 'Activate account',
                    html: '<h1>Activate account</h1><p>Please click activation link on bottom.</p><a href="' + url.format({ protocol: req.protocol, host: clientHost }) + '/activate/' + key + '">Activate</a>'
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Email send: " + info.response);
                    }
                });

                res.json(returnState(true, "Account has been created. Now check email and activate account."));
            });
        } else {
            res.json(returnState(false, null, { msg: "You already registered. Please login first." }));
        }
    });
});

router.post('/activate/', (req, res, next) => {
    var query = con.query("SELECT COUNT(*) AS userExist FROM users WHERE username=? AND email=? AND token=?", [req.body.username, req.body.email, req.body.token], (err, result) => {
        if (err) throw err;
        if (result[0].userExist === 1) {
            con.query("UPDATE users SET activated=1 WHERE token=?", [req.body.token], (err, result) => {
                if (err) throw err;

                res.json(returnState(true, "Account activated. Now try login."));
            });
        } else {
            res.status(404).json(returnState(false, null, { msg: "Invalid url" }));
        }
    });
});

router.post('/auth', Auth.ensureAuthorized, (req, res, next) => {
    res.status(200).json(returnState(true));
});

module.exports = router;
