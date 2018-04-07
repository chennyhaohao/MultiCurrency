var express = require('express');
var crypto = require('crypto');
var mysql = require('mysql');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var router = express.Router();
var controller = require('../controller/template.js');
var con = require('./db.js');
var Auth = require('./Authentication.js');

process.env.JWT_SECRET = "58F42AF9AC6B673724A6A67BEE39B";

function returnState(status = false, data = {}, error = null) {
    return { status: status, data: data, error: error };
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
router.get('/', Auth.ensureAuthorized, function (req, res, next) {
	//var result = controller.increment();
    res.json({ status: "done" });
});

router.post('/login', function (req, res, next) {
    let username = req.body.login;
    let password = Auth.sha256(req.body.password);

    con.query("SELECT * FROM users WHERE ?", { username: username }, function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            res.json(returnState(false, null, { msg: "Wrong username or password!" }));
            return;
        }

        result = result[0];

        const token = Auth.encodeToken(result);

        if (password === result.password) {
            con.query("UPDATE users SET token=? WHERE username=?", [token, username], function (err, user) {
                if (err) throw err;
                res.json(returnState(true, { token: token }));
            });
        } else {
            res.json(returnState(false, null, { msg: "Wrong username or password!" }));
        }
    });
});

router.post('/register', function (req, res, next) {

    con.query("SELECT COUNT(*) AS thisSameUsers FROM users WHERE username=? OR email=?", [req.body.username, req.body.email], function (err, result) {
        if (err) throw err;
        if (result[0].thisSameUsers === 0) {
            let password = Auth.sha256(req.body.password);
            con.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [req.body.username, req.body.email, password], function (err, result) {
                if (err) throw err;

                res.json(returnState(true, "Account has been created. Now login."));
            });
        } else {
            res.json(returnState(false, null, { msg: "You already registered. Please login first." }));
        }
    });
});

router.post('/auth', Auth.ensureAuthorized, (req, res, next) => {
    res.status(200).json(returnState(true));
});

module.exports = router;
