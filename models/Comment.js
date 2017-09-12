var mongoose = require('mongoose');
var commentsSchemas = require('../schemas/comments');

module.exports = mongoose.model('Comment',commentsSchemas);