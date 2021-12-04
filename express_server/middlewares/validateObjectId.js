const mongoose = require('mongoose');
const { requestLogger } = require('../logger');


module.exports = function (req, res, next) {

	// validating object id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Invalid ID"}));
    }

    next();
}
