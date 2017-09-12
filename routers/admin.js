var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Artical = require('../models/Artical');
var reg1 = new RegExp("\r\n","g");
var reg2 = new RegExp(" ","g");

router.use(function(req,res,next){
	if(!req.userInfo.isAdmin){
		//如果当前用户是非管理员
		res.send('对不起，只有管理员才可以进入后台管理');
		return;
	}
	next();
})

router.get('/',function(req,res,next){
	res.render('admin/backStage',{
		userInfo:req.userInfo
	});
})


/**
*用户管理
*/

router.get('/user',function(req,res,next){
	
	/**
	*从数据库中读取所有的用户数据
	*
	*limit(Number):限制获取的数据条数
	*
	*skip(Number):忽略数据的条数
	*
	*每页显示2条
	*1：1-2 skip:0 -> (当前页-1)*limit
	*2：3-4 skip:2
	**/
	
	var page = Number(req.query.page || 1);
	var limit = 2;
	var pages = 0;
	
	User.count().then(function(count){
		
		//计算总页数
		pages = Math.ceil( count/limit );
		//取值不能超过pages
		page = Math.min( page,pages );
		//取值不能小于1
		page = Math.max( page,1 );
		
		var skip = (page-1)*limit;

		/**
		**1：升序
		**-1：降序
		**/
		
		User.find().sort({_id:-1}).limit(limit).skip(skip).then(function(users){
			res.render('admin/userManage',{
				userInfo:req.userInfo,
				users:users,
				
				count:count,
				pages:pages,
				limit:limit,
				page:page
			});
		});
	})	
})

/**
**分类首页
**/


router.get('/category',function(req,res,next){
	var page = Number(req.query.page || 1);
	var limit = 2;
	var pages = 0;
	
	Category.count().then(function(count){
		
		//计算总页数
		pages = Math.ceil( count/limit );
		//取值不能超过pages
		page = Math.min( page,pages );
		//取值不能小于1
		page = Math.max( page,1 );
		
		var skip = (page-1)*limit;
		
		Category.find().limit(limit).skip(skip).then(function(categories){
			res.render('admin/categoryManage',{
				userInfo:req.userInfo,
				categories:categories,
				
				count:count,
				pages:pages,
				limit:limit,
				page:page
			});
		});
	})
})

/**
**添加分类
**/

router.get('/category/add',function(req,res){
	res.render('admin/addCategory',{
		userInfo:req.userInfo
	});
})

/**
**分类的保存
**/

router.post('/category/add',function(req,res){
	
	var name = req.body.name || '';
	
	if(name == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'名称不能为空!'
		});
		return
	}
	
	//数据库中是否已经存在同名分类名称

	Category.findOne({
		name:name
	}).then(function(rs){
		if(rs){
			//数据库中已经存在该分类了
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类已经存在了'
			});
			return
		}else{
			//数据库中不存在该分类，可以保存
			var category =  new Category({
				name:name
			})
			category.save();
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'分类保存成功',
				url:'/ad/category'
			});			
		}
	})
})

/**
*分类修改
**/
router.get('/category/edit',function(req,res){
	
	//获取要修改的分类的信息，并且用表单的形式表现出来
	var id = req.query.id || '';
	
	//获取要修改的分类的信息
	Category.findOne({
		_id:id
	}).then(function(category){

		if(!category){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在！'
			})
		}else{
			res.render('admin/categoryEdit',{
				userInfo:req.userInfo,
				category:category
			})
		}
	})
})

/**
*分类的修改保存
**/
router.post('/category/edit',function(req,res){
	
	//获取要修改的分类的信息，并且用表单的形式表现出来
	var id = req.query.id || '';
	//获取post提交过来的名称
	var name = req.body.name || '';

	//获取要修改的分类的信息
	Category.findOne({
		_id:id
	}).then(function(category){

		if(!category){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在！'
			})
			return
		}else{
			//当用户没有做任何的修改就提交的时候
			console.log(category.name)
			if(name == category.name){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'修改分类名称成功！',
					url:'/ad/category'
				})
				return
			}else{
				console.log(name)
				//要修改的分类名称是否已经存在在数据库中
				Category.findOne({
					_id:{$ne:id},
					name:name
				}).then(function(sameCategory){

					if(sameCategory){
						res.render('admin/error',{
							userInfo:req.userInfo,
							message:'数据库中是否已经存在同名分类！'
						})
					return
					}else{
						Category.update({
							_id:id,
						},{
							name:name
						}).then(function(){
							res.render('admin/success',{
								userInfo:req.userInfo,
								message:'修改分类名称成功！',
								url:'/ad/category'
							})
						})
					}
				})
			}
		}
	})
})


/**
*分类删除
*/

router.get('/category/delete',function(req,res){
	
	//获取要删除的分类的信息，并且用表单的形式表现出来
	var id = req.query.id || '';
	
	//获取要修改的分类的信息
	Category.findOne({
		_id:id
	}).then(function(category){

		if(!category){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在！'
			})
		}else{
			res.render('admin/enterDelete',{
				userInfo:req.userInfo,
				category:category
			})
		}
	})
})

router.get('/category/enterdelete',function(req,res){
	//获取要删除的分类的id
	var id = req.query.id || '';
	
	Category.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除分类成功！',
			url:'/ad/category'
		})
	})
})

/**
**文章管理首页
**/

router.get('/artical',function(req,res){
	
	var page = Number(req.query.page || 1);
	var limit = 2;
	var pages = 0;
	
	Artical.count().then(function(count){
		
		//计算总页数
		pages = Math.ceil( count/limit );
		//取值不能超过pages
		page = Math.min( page,pages );
		//取值不能小于1
		page = Math.max( page,1 );
		
		var skip = (page-1)*limit;

		/**
		**1：升序
		**-1：降序
		**/
		
		Artical.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(articals){

			res.render('admin/articalManage',{
				userInfo:req.userInfo,
				articals:articals,
				
				count:count,
				pages:pages,
				limit:limit,
				page:page
			});

			console.log(articals)
		});
	})	
})


/**
**添加文章页面
**/

router.get('/artical/add',function(req,res){

	Category.find().then(function(categories){
		res.render('admin/addArtical',{
			userInfo:req.userInfo,
			categories:categories
		})
	})


})

/**
**文章内容保存
**/

router.post('/artical/add',function(req,res){

	if(req.body.category == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容分类不能为空！'
		})
		return
	}

	if(req.body.title == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容标题不能为空！'
		})
		return
	}

	if(req.body.content == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容不能为空！'
		})
		return
	}

	//保存数据到数据库
	new Artical({
		category:req.body.category,
		title:req.body.title,
		user:req.userInfo._id.toString(),
		description:req.body.description,
		content:req.body.content.replace(reg1,"<br>").replace(reg2,"&nbsp;"),
		addTime:new Date()
	}).save().then(function(rs){

		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'文章保存成功！',
			url:'/ad/artical'
		})
	})
})

/**
**修改文章
**/

router.get('/artical/edit',function(req,res){
	//获取要修改文章的分类的id
	var id = req.query.id || '';
	var categories = [];

	Category.find().then(function(rs){

		categories = rs;
		return Artical.findOne({
			_id:id
		}).populate('category')
	}).then(function(artical){

			if(!artical){
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'指定内容不存在！'
				})
			}else{
				res.render('admin/articalEdit',{
					userInfo:req.userInfo,
					categories:categories,
					artical:artical
				})				
			}
		})
	
})

/**
**保存修改的文章
**/

router.post('/artical/edit',function(req,res){
	//获取要保存修改的文章的id
	var id = req.query.id || '';
	
	if(req.body.category == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容分类不能为空！'
		})
		return
	}

	if(req.body.title == ''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容标题不能为空！'
		})
		return
	}

	//保存数据到数据库
	Artical.update({
		_id:id,
	},{
		category:req.body.category,
		title:req.body.title,
		description:req.body.description,
		content:req.body.content.replace(reg1,"<br>").replace(reg2,"&nbsp;"),
		addTime:new Date()
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'文章修改成功！',
			url:'/ad/artical/edit?id=' + id
		})
	})
})


/***
**删除文章
*/

router.get('/artical/delete',function(req,res){
	
	//获取要删除的文章的信息，并且用表单的形式表现出来
	var id = req.query.id || '';
	
	//获取要删除的文章的信息
	Artical.findOne({
		_id:id
	}).then(function(artical){

		if(!artical){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'文章不存在！'
			})
		}else{
			res.render('admin/enterDelete',{
				userInfo:req.userInfo,
				artical:artical
			})
		}
	})
})


router.get('/artical/enterdelete',function(req,res){
	//获取要删除的分类的id
	var id = req.query.id || '';

	Artical.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除文章成功！',
			url:'/ad/artical'
		})
	})
})


module.exports = router;