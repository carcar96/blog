
var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Artical = require('../models/Artical');
var User = require('../models/User');
var Comment = require('../models/Comment');

var data;

/**
**处理通用的数据
***/

router.use(function(req,res,next){

	data = {
		userInfo:req.userInfo,
		categories:[],
	}

	Category.find().then(function(categories){
		data.categories = categories;
		next();
	})

})


/**
*前台首页
*/
router.get('/',function(req,res,next){

	data.category = req.query.category || '';
	data.count = 0;
	data.page = Number(req.query.page || 1);
	data.limit = 2;
	data.pages = 0;

	var where = {};
	if(data.category){
		where.category = data.category
	}
	
	Artical.where(where).count().then(function(count){

		//文章总数
		data.count = count;
		//计算总页数
		data.pages = Math.ceil( data.count / data.limit );
		//取值不能超过pages
		data.page = Math.min( data.page,data.pages );
		//取值不能小于1
		data.page = Math.max( data.page,1 );
		
		var skip = (data.page-1)*data.limit;

		return Artical.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['category','user']);

	}).then(function(articals){	
		data.articals = articals;

		/*热点文章*/
		Artical.find().sort({views:-1}).limit(5).populate(['category','user']).then(function(hotArticals){
			data.hotArticals = hotArticals;
		})

		/*热评文章*/
		Artical.find().sort({commentCounts:-1}).limit(5).populate(['category','user']).then(function(hotCommentArticals){
			data.hotCommentArticals = hotCommentArticals;
			res.render('main/index',data);
		})
		
	})

});


/**
*阅读全文
**/
router.get('/view',function(req,res){
	var articalId = req.query.articalId || '';
	data.category = req.query.category || '';

	var where = {};
	if(data.category){
		where.category = data.category
	}

	Artical.findOne({
		_id:articalId
	}).populate('user').then(function(artical){
		data.artical = artical;
		artical.views ++;
		artical.save();

		/*热点文章*/
		Artical.find().sort({views:-1}).limit(5).populate(['category','user']).then(function(hotArticals){
			data.hotArticals = hotArticals;
		})

		/*热评文章*/
		Artical.find().sort({commentCounts:-1}).limit(5).populate(['category','user']).then(function(hotCommentArticals){
			data.hotCommentArticals = hotCommentArticals;
			res.render('main/view',data);
		})

	})
})

/**
*个人主页
**/
router.get('/Info',function(req,res){
	var userId = req.query.Id || '';
	data.index = 0;

	data.articalsCount = 0;
	data.articalsPage = Number(req.query.articalsPage || 1);
	data.articalsLimit = 2;
	data.articalsPages = 0;

	data.commentsCount = 0;
	data.commentsPage = Number(req.query.commentsPage || 1);
	data.commentsLimit = 2;
	data.commentsPages = 0;

	data.replysCount = 0;
	data.replysPage = Number(req.query.replysPage || 1);
	data.replysLimit = 2;
	data.replysPages = 0;


	User.findOne({
		_id:userId
	}).then(function(Info){

		if(req.query.articalsPage == undefined){
			Info.newVisits ++;
			Info.save();
		}
		data.Info = Info;

		Comment.find({
			commentUserId:userId	
		}).then(function(comments){

			data.commentsCount = comments.length;
			data.commentsPages = Math.ceil( data.commentsCount / data.commentsLimit );
			data.commentsPage = Math.min( data.commentsPage,data.commentsPages );
			data.commentsPage = Math.max( data.commentsPage,1 );
			
			var skip = (data.commentsPage-1)*data.commentsLimit;

			return Comment.find({commentUserId:userId}).sort({_id:-1}).limit(data.commentsLimit).skip(skip).populate('artical');

		}).then(function(comments){	
			data.Info.comments = comments;

			if(req.query.commentsPage){
				data.index = 0;
			}

			if(!Info.isAdmin){
				res.render('main/info',data);
			}
		})	
			
		Comment.aggregate(
            {$unwind:"$replyList"},      //展开task数组
            {$match:{"replyList.replyUserId":userId}}
 		).then(function(replys){

 			data.replysCount = replys.length;
		 	data.replysPages = Math.ceil( data.replysCount / data.replysLimit );
		 	data.replysPage = Math.min( data.replysPage,data.replysPages );
		 	data.replysPage = Math.max( data.replysPage,1 );
			
		 	var skip = (data.replysPage-1)*data.replysLimit;

		 	return Comment.aggregate([
            	{$unwind:"$replyList"},      //展开task数组
            	{$match:{"replyList.replyUserId":userId}},
             	{$sort:{"replyList.replyTime":-1}},
             	{$skip:skip},
 				{$limit:data.replysLimit}
	 		]).then(function(replys){
	 			data.Info.replys = replys;

	 			if(req.query.replysPage){
					data.index = 1;
				}
	 		})	
	 	})

 		if(Info.isAdmin){
			Artical.find({
				user:userId
			}).then(function(articals){

				//文章总数
				data.articalsCount = articals.length;
				//计算总页数
				data.articalsPages = Math.ceil( data.articalsCount / data.articalsLimit );
				//取值不能超过pages
				data.articalsPage = Math.min( data.articalsPage,data.articalsPages );
				//取值不能小于1
				data.articalsPage = Math.max( data.articalsPage,1 );
				
				var skip = (data.articalsPage-1)*data.articalsLimit;

				return Artical.find({user:userId}).sort({_id:-1}).limit(data.articalsLimit).skip(skip).populate('category');

			}).then(function(articals){	
				data.Info.articals = articals;
				if(req.query.articalsPage){
					data.index = 2;				
				}
				res.render('main/info',data);
			})
		}

	})

})

/*
***我的消息
*/
router.get('/myNews',function(req,res){
	var userId = req.query.infoId || '';

	data.newsCount = 0;
	data.newsPage = Number(req.query.newsPage || 1);
	data.newsLimit = 2;
	data.newsPages = 0;

	User.findOne({
		_id:userId
	}).then(function(Info){
		data.Info = Info;
		if(userId == req.userInfo._id){
			Info.newMessages = 0;
			Info.save();
		}

		Comment.aggregate(
            {$unwind:"$replyList"},      //展开task数组
            {$match:{"replyList.receiverId":userId.toString()}}
 		).then(function(news){
 			data.newsCount = news.length;
		 	data.newsPages = Math.ceil( data.newsCount / data.newsLimit );
		 	data.newsPage = Math.min( data.newsPage,data.newsPages );
		 	data.newsPage = Math.max( data.newsPage,1 );
			
		 	var skip = (data.newsPage-1)*data.newsLimit;

		 	return Comment.aggregate([
            	{$unwind:"$replyList"},      //展开task数组
            	{$match:{"replyList.receiverId":userId.toString()}},
             	{$sort:{"replyList.replyTime":-1}},
             	{$skip:skip},
 				{$limit:data.newsLimit}
	 		]).then(function(news){
	 			data.infoNews = news;
	 			res.render('main/news',data);
	 		})	
	 	})
	})
})

module.exports = router;