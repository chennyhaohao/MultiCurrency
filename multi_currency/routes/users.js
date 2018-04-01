var express = require('express');
var crypto = require('crypto');
var mysql = require('mysql');
var router = express.Router();
var controller = require('../controller/template.js');

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

function execError(err) {
    switch (err.code) {
        case PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR:
            con = mysql.createConnection(dbParams);
        break;
    }
}

router.get('/', function(req, res, next) {
	var result = controller.increment();
	res.send("done");
});

router.post('/login', function (req, res, next) {
    let username = req.body.login;
    let password = sha256(req.body.password);
    let token = sha256(Date.now().toString());

    con.query("SELECT * FROM users WHERE ?", { username: username }, function (err, result) {
        if (err) {
            execError(err);
            res.json(returnState(false, null, { msg: err }));
            return;
        }
        if (result.length == 0) {
            res.json(returnState(false, null, { msg: "Wrong username or password!" }));
            return;
        }

        result = result[0];

        if (password === result.password) {
            con.query("UPDATE users SET token=? WHERE username=?", [token, username]);
            res.json(returnState(true, { username: result.username, token: token }));
        } else {
            res.json(returnState(false, null, { msg: "Wrong username or password!" }));
        }
    });
});

module.exports = router;
