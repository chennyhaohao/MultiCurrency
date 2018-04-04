var express = require('express');
var crypto = require('crypto');
var mysql = require('mysql');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var router = express.Router();
var controller = require('../controller/template.js');
var Auth = require('./Authentication.js');

process.env.JWT_SECRET = "58F42AF9AC6B673724A6A67BEE39B";

function returnState(status = false, data = {}, error = null) {
    return { status: status, data: data, error: error };
}

function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("base64");
}

const dbParams = {
    host: 's69.hekko.pl',
    user: 'polkomwq_mc',
    password: 'hvrS9N0H',
    database: 'polkomwq_mc',
}

var con = mysql.createConnection(dbParams);

function decodeToken(token, callback) {
    const payload = jwt.decode(token, process.env.JWT_SECRET);
    const now = moment().unix();

    if (payload == null) callback("Invalid token");
    else if (now > payload.exp) callback("Token has expired");
    else callback(null, payload);
}

function encodeToken(user) {
    const payload = {
        exp: moment().add(14, 'days').unix(),
        iat: moment().unix(),
        sub: user.id
    }
    return jwt.sign(payload, process.env.JWT_SECRET);
}

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        decodeToken(bearerToken, (err, payload) => {
            if (err) {
                return res.status(401).json({ status: "Token has expired" });
            } else {
                con.query("SELECT * FROM users WHERE id=?", [payload.sub], (err, user) => {
                    if (err)
                        res.status(500).json({ status: err });
                    else if (user.length === 0)
                        res.status(500).json({ status: 'Invalid token' });
                    else {
                        req.user = user;
                        next();
                    }
                });
            }
        });
    } else {
        res.status(403).json({ status: "Please log in" });
    }
}

router.get('/', Auth.ensureAuthorized, function (req, res, next) {
	//var result = controller.increment();
    console.log(req.user);
    res.json({ status: "done" });
});

router.post('/login', function (req, res, next) {
    let username = req.body.login;
    let password = sha256(req.body.password);

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
            let password = sha256(req.body.password);
            con.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [req.body.username, req.body.email, password], function (err, result) {
                if (err) throw err;

                res.json(returnState(true, "Account has been created. Now login."));
            });
        } else {
            res.json(returnState(false, null, { msg: "You already registered. Please login first." }));
        }
    });
});

module.exports = router;
