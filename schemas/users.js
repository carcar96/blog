

var mongoose = require('mongoose');

//用户表结构

// var Schema = mongoose.Schema;

// var blogSchema = new Schema({
//   title:  String,
//   author: String,
//   body:   String,
//   comments: [{ body: String, date: Date }],
//   date: { type: Date, default: Date.now },
//   hidden: Boolean,
//   meta: {
//     votes: Number,
//     favs:  Number
//   }
// });

module.exports = new mongoose.Schema({

	//用户名
	username:String,
	//密码
	password:String,
	
	//是否是管理员
	isAdmin:{
		type:Boolean,
		default:false
	},

	//新消息数
	newMessages:{
		type:Number,
		default:0
	},

	//新评论数
	newComments:{
		type:Number,
		default:0
	},

	//被访问数
	newVisits:{
		type:Number,
		default:0
	}
});


