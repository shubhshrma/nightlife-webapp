var mongoose = require('mongoose');

var BarSchema = mongoose.Schema({
 	id:{
 		type: String,
 		index: true
 	},
 	strength:{
 		type: Number,
 		min: 0
 	}
 });
var Bar = module.exports = mongoose.model('Bar', BarSchema);

module.exports.createBar = function(newBar, callback) {
	newBar.save(callback);
};

module.exports.getBarById = function(id, callback) {
	var query = {id: id};
	Bar.findOne(query, callback);
};
