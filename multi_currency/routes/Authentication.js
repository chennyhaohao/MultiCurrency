var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var mysql = require('mysql');


const dbParams = {
    host: 's69.hekko.pl',
    user: 'polkomwq_mc',
    password: 'hvrS9N0H',
    database: 'polkomwq_mc',
}

var con = mysql.createConnection(dbParams);

const Auth = {
	sha256: (data) => {
		return crypto.createHash("sha256").update(data).digest("base64");
	},

	decodeToken: (token, callback) => {
	    const payload = jwt.decode(token, process.env.JWT_SECRET);
	    const now = moment().unix();

	    if (payload == null) callback("Invalid token");
	    else if (now > payload.exp) callback("Token has expired");
	    else callback(null, payload);
	},

	encodeToken: (user) => {
	    const payload = {
	        exp: moment().add(14, 'days').unix(),
	        iat: moment().unix(),
	        sub: user.id
	    }
	    return jwt.sign(payload, process.env.JWT_SECRET);
	},

	ensureAuthorized: (req, res, next) => {
	    var bearerToken;
	    var bearerHeader = req.headers["authorization"];
	    if (typeof bearerHeader !== 'undefined') {
	        var bearer = bearerHeader.split(" ");
	        bearerToken = bearer[1];
	        Auth.decodeToken(bearerToken, (err, payload) => {
	            if (err) {
	            	console.log("Decode err");
	                return res.status(401).json({ status: "Token has expired" });
	            } else {
	                con.query("SELECT * FROM users WHERE id=?", [payload.sub], (err, user) => {
	                    if (err) {
	                    	console.log("db err");
	                        res.status(500).json({ status: err });
	                    }
	                    else if (user.length === 0) {
	                        res.status(500).json({ status: 'Invalid token' });
	                    }
	                    else {
	                        req.user = user[0];
	                        next();
	                    }
	                });
	            }
	        });
	    } else {
	        res.status(403).json({ status: "Please log in" });
	    }
	},

};

module.exports = Auth;