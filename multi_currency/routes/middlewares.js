const Middlewares = {
	checkAuthMiddleware: (req, res, next) => {
		//Check auth, if not authed send error back;
		return next();
	}
};

module.exports = Middlewares;