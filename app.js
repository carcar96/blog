
/**
*应用程序的启动(入口)文件
*/

//加载express模块
var express = require('express');
//加载模板处理模块---前后端分离
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载cookies模块
var Cookies = require('cookies');
//创建app应用 => NODEJS Http.createServer();
var app = express();

var User = require('./models/User');

mongoose.Promise = require('bluebird');

// 设置静态文件目录
app.use('/public',express.static( __dirname + '/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//	第一个参数：模板引擎的名称，同时也是模板文件的后缀，
//	第二个参数用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的位置，第一个参数必须是views，第二个参数是目录路径
app.set('views','./views');
//注册所使用的模板引擎
//第一个参数必须是view engine，
//第二个参数和app.engine这个方法定义的模板引擎的名称（第一个参数）是一致的
app.set('view engine','html');

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

//bodyparser设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookies
app.use( function(req,res,next){
	req.cookies = new Cookies(req,res);

	//解析登录用户的cookie信息
	 req.userInfo = {};	
	 if(req.cookies.get('userInfo')){
		 try{
			 req.userInfo = JSON.parse(req.cookies.get('userInfo'))
			 
			 //获取当前登录用户的类型，是否是管理员
			 User.findById(req.userInfo._id).then(function(userInfo){
				 req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				 
				 //处理消息数
				 req.userInfo.newMessages = Number(userInfo.newMessages);
				 req.userInfo.newComments = Number(userInfo.newComments);
				 req.userInfo.newVisits = Number(userInfo.newVisits);

				 next();
			 })
		 }catch(e){
			 console.log(e)
		 }
	 }else{ 	
		next();
	 }

});

/*
*根据不同功能划分模块
*/

app.use('/ad',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

/*
*首页
*	req request对象
*	res response对象
*	next 函数
*/

app.get('/',function(req,res,next){

	/*
	*读取views目录下的指定文件，解析并返回给客户端
	*第一个参数：表示模板的文件，相对于views目录 views/index.html
	*第二和参数：传递给模板使用的数据
	*/
	res.render('index');
})

//监听http请求
mongoose.connect('mongodb://localhost:27018/blog',function(err){
	if(err){
		console.log('数据库连接失败')
	}else{
		console.log('数据库连接成功');
		app.listen(1234);
		console.log('listen 1234...');
	}
});
