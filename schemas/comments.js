

var mongoose = require('mongoose');

//文章的表结构

module.exports = new mongoose.Schema({

	//关联字段 - 用户id
	user:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'User'
	},

	//关联字段 - 文章id
	artical:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Artical'
	},

	//评论人的id
	commentUserId:{
		type:String,
		default:''
	},
	
	//评论人
	commentUserName:{
		type:String,
		default:''
	},

	//评论内容
	content:{
		type:String,
		default:''
	},

	//添加时间
	postTime:{
		type:Date,
		default:''
	},

	//回复
	replyList:{
		type:Array,
		default:[]
	}

});


