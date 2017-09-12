

var mongoose = require('mongoose');
var articalsSchemas = require('../schemas/articals');

module.exports = mongoose.model('Artical',articalsSchemas);
