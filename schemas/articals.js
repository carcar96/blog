

var mongoose = require('mongoose');

//文章的表结构

module.exports = new mongoose.Schema({

	//关联字段 - 文章分类的id
	category:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Category'
	},

	//文章标题
	title:String,

	//关联字段 - 用户id
	user:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'User'
	},

	//添加时间
	addTime:{
		type:Date,
		default:''
	},

	//阅读量
	views:{
		type:Number,
		default:0
	},

	//简介
	description:{
		type:String,
		default:''
	},

	//内容
	content:{
		type:String,
		default:''
	},

	//评论量
	commentCounts:{
		type:Number,
		default:0
	}
	
});


