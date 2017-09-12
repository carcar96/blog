

var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Artical = require('../models/Artical');
var Comment = require('../models/Comment');

//统一返回格式
var responseData;

router.use(function(req,res,next){
	responseData={
		code:0,
		message:'',
		articalComments:0
	}	
	next();
})

/**
**用户注册
*	注册逻辑
*
*	1.用户是否已经被注册了
*		数据库查询
*
**/
router.post('/user/register',function(req,res,next){
	
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;	

	
	
	//用户名是否已经被注册，如果数据库存在和我们要注册的用户名同名的数据，则表示该用户名已经被注册
		
		User.findOne({username:username},function(err,doc){   
        if(err){ 
            console.log(err);
        }else if(doc){ 
            responseData.code = 1;
			responseData.message = '用户名已经被注册了';
			res.json(responseData);
        }else{ 
            var user = new User({
				username:username,
				password:password
			});
			user.save();
			responseData.message = '注册成功';
			res.json(responseData);
        }
    });
		
});

/**
*	登录
**/

router.post('/user/login',function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	
	//查询数据库中相同用户名和密码的记录是否存在，如果成功则登录成功
	User.findOne({
		username:username,
		password:password
	},function(err,userInfo){
		if(err){ 
            console.log(err);
        }else if(!userInfo){ 
            responseData.code = 2;
			responseData.message = '用户名或密码错误';
			res.json(responseData);
        }else{ 
            //用户名和密码正确
			responseData.message = '登录成功';
			responseData.userInfo = {
				_id:userInfo._id,
				username:username
			}
			req.cookies.set('userInfo',JSON.stringify({
				_id:userInfo._id,
				username:username
			}));
			res.json(responseData);
			return
        }
	})
});

/**
*	退出
***/

router.post('/user/logout',function(req,res){
	req.cookies.set('userInfo',null);
	res.json(responseData);
})


/**
**获取指定文章的所有评论
***/

router.get('/comment',function(req,res){
	var articalId = req.query.articalId || '';
	Comment.find({
		artical:articalId
	}).then(function(comments){

		responseData.data = comments;

		Artical.findOne({
			_id:articalId
		}).then(function(artical){

			responseData.articalComments=artical.commentCounts;
			res.json(responseData);
			return
		})		

	})
})


/**
***提交评论
**/
router.post('/comment/post',function(req,res){
	var articalId = req.body.articalId;
	var authorId = req.body.authorId;

	//保存数据到数据库
	new Comment({
		artical : articalId,
		commentUserId:req.userInfo._id,
		commentUserName:req.userInfo.username,
		postTime : new Date(),
 		//评论的内容
 		content:req.body.content
	}).save().then(function(newComment){
		if(authorId!==newComment.commentUserId){
			User.findOne({
				_id:authorId
			}).then(function(userInfo){
				userInfo.newMessages ++;
				userInfo.save();
			})
		}

		User.findOne({
			_id:newComment.commentUserId
		}).then(function(userInfo){
			userInfo.newComments ++;
			userInfo.save();
		})

		Comment.find({
			artical:articalId
		}).then(function(comments){
			responseData.data = comments;

			Artical.findOne({
				_id:articalId
			}).then(function(artical){
				artical.commentCounts ++;
				artical.save();
				responseData.articalComments=artical.commentCounts;
				res.json(responseData);
			})
		})

		

	})		

})


/***
***删除评论
***/

router.get('/comment/delete',function(req,res){
	var id = req.query.CommentId || '';
	var articalId = req.query.articalId;
	var authorId = req.query.authorId;
	var length = 0;
	var L = 0;

	Comment.findOne({
		_id:id
	}).then(function(comment){		
		length = comment.replyList.length + 1
		return 
	}).then(function(){

		Comment.remove({
			_id:id
		}).then(function(){

			Comment.find({
				artical:articalId
			}).then(function(comments){
				responseData.data = comments;

		 		Artical.findOne({
					_id:articalId
				}).then(function(artical){
					artical.commentCounts -= length;
					artical.save();
					responseData.articalComments=artical.commentCounts;
					res.json(responseData);
				})	
			})
		})
	})
})

/**
**回复评论
*/

router.post('/comment/reply',function(req,res){
	var id = req.body.CommentId;
	var authorId = req.body.authorId;
	var articalId = req.body.articalId;

	var receiverId = req.body.receiverId||'';
	var receiverName = req.body.receiverName||'';
	var replyComment = req.body.replyComment;

	var reg = new RegExp(receiverName,"i");
	var patt1=new RegExp(" 回复 "+receiverName+" : ");
	
	if( receiverName && patt1.test(replyComment) ){
		replyComment = replyComment.replace(reg,"<a href='/Info?Id="+receiverId+"'>"+receiverName+"</a>")
	}

	var reply = {
		replyUserId: req.userInfo._id,
		replyUsername: req.userInfo.username,
		replyTime: new Date(),
		replyComment: replyComment,
		receiverId: receiverId,
		receiverName: receiverName
	}

	User.findOne({
		_id:reply.replyUserId
	}).then(function(userInfo){
		userInfo.newComments ++;
		userInfo.save();
	})

	Comment.findOne({
		_id: id
	}).then(function(comment){
		
		if(comment.commentUserId==authorId){
			//作者给自己评论
			if(comment.commentUserId==reply.replyUserId){
				//作者给自己的评论留言
				
				if(receiverId){
					//有@人
					User.findOne({
						username:receiverName
					}).then(function(userInfo){
						userInfo.newMessages ++;
						return userInfo.save();
					})
				}
			}else{
				//别人给作者的评论留言
				if(comment.commentUserName == receiverName){
					User.findOne({
						username:receiverName
					}).then(function(userInfo){
						userInfo.newMessages ++;
						userInfo.save();
					})
				}else{
					User.findOne({
						_id:comment.commentUserId
					}).then(function(userInfo){
						userInfo.newMessages ++;
						return	userInfo.save().then(function(){
							if(receiverName){
								//有@人
								User.findOne({
									username:receiverName
								}).then(function(userInfo){
									userInfo.newMessages ++;
									userInfo.save();
								})
							}
						})
					})
				}
			}

		}else{
			//某人给作者评论

			if(comment.commentUserId==reply.replyUserId){
				//某人在自己的评论留言

				if(receiverId){
					//有@人
					User.findOne({
						username:receiverName
					}).then(function(userInfo){
						userInfo.newMessages ++;
						userInfo.save();
					})
				}
			}else{
				//其他人在某人的评论留言
				if(comment.commentUserName == receiverName){
					User.findOne({
						username:receiverName
					}).then(function(userInfo){
						userInfo.newMessages ++;
						userInfo.save();
					})
				}else{
					User.findOne({
						_id:comment.commentUserId
					}).then(function(userInfo){
						userInfo.newMessages ++;
						return	userInfo.save().then(function(){
							if(receiverName){
								//有@人
								User.findOne({
									username:receiverName
								}).then(function(userInfo){
									userInfo.newMessages ++;
									userInfo.save();
								})
							}
						})
					})
				}
			}
		}

		comment.replyList.push(reply)
		return comment.save()
	}).then(function(){

		Comment.find({
			artical:articalId
		}).then(function(comments){
			responseData.data = comments;

			Artical.findOne({
				_id:articalId
			}).then(function(artical){
				artical.commentCounts ++;
				artical.save();
				responseData.articalComments=artical.commentCounts;
				res.json(responseData);
			})
		})
	})

})

/**
**删除回复评论
*/

router.get('/comment/reply/delete',function(req,res){
	var id = req.query.CommentId;
	var articalId = req.query.articalId;
	var authorId = req.query.authorId;
	var index = req.query.index;

	Comment.findOne({
		_id:id
	}).then(function(comment){		
		comment.replyList.splice(index,1)
		return comment.save()
	}).then(function(newComment){

		Comment.find({
			artical:articalId
		}).then(function(comments){
			responseData.data = comments;

			Artical.findOne({
				_id:articalId
			}).then(function(artical){
				artical.commentCounts --;
				artical.save();
				responseData.articalComments=artical.commentCounts;
				res.json(responseData);
			})
		})
	})
})


module.exports = router;