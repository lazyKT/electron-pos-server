/**
 * Logging Server Requests
 * */
  

exports.requestLogger = function (req) {

	const log = {
		name: "request",
		message: req
	};

	process.send(JSON.stringify(log));
}



exports.errorLogger = function (message) {

	const log = {
		name: "error",
		message
	};

	process.send(JSON.stringify(log));
}



