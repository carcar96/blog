
$(function(){
	
	var $loginBox = $('#loginBox');
	var $registerBox = $('#registerBox');
	var $userBox = $('#userBox');
		
	//切换到注册面板
	$loginBox.find('#jumpLink').on('click',function(){
		$registerBox.show();
		$loginBox.hide();
	});
	
	//切换到登录面板
	$registerBox.find('#jumpLink').on('click',function(){
		$registerBox.hide();
		$loginBox.show();
	});
	
	//注册
	$registerBox.find('#registerBtn').on('click',function(){
		
		var username = $registerBox.find('[name="username"]').val();
		var password = $registerBox.find('[name="password"]').val();
		var repassword = $registerBox.find('[name="repassword"]').val();
		
		if( username == '' ){
			//用户是否为空
			$registerBox.find('.warningbox').html('用户不能为空')
		}else if( password == '' ){
			//密码是否为空
			$registerBox.find('.warningbox').html('密码不能为空')
		}else if( password != repassword ){
			$registerBox.find('.warningbox').html('两次输入的密码不一致')
		}else{
			//通过ajax提交请求
			$.ajax({
				type:'post',
				url:'/api/user/register',
				data:{
					username:username,
					password:password,
					repassword:repassword,
				},
				dataType:'json',
				success:function(result){
					console.log(result)					
					$registerBox.find('.warningbox').html(result.message);
					
					if(!result.code){
						$registerBox.find('.warningbox').html(result.message);

						setTimeout(function(){
							$registerBox.hide();
							$loginBox.show();
							$("#judge").val('login');
						},1000);
					}
				}
			})
		}

	});
	
	//登录
	$loginBox.find('#loginBtn').on('click',function(){
		
		var username = $loginBox.find('[name="username"]').val();
		var password = $loginBox.find('[name="password"]').val();
		
		if( username == '' ){
			//用户是否为空
			$loginBox.find('.warningbox').html('用户不能为空')
		}else if( password == '' ){
			//密码是否为空
			$loginBox.find('.warningbox').html('密码不能为空')
		}else{

			//通过ajax提交请求
			$.ajax({
				type:'post',
				url:'/api/user/login',
				data:{
					username:username,
					password:password,
				},
				dataType:'json',
				success:function(result){

					$loginBox.find('.warningbox').html(result.message);

					if(!result.code){
						//登录成功
						window.location.reload();

					}
				}
			})
		}

	});

	
	//退出
	$('#logoutBtn').on('click',function(){
		$.ajax({
			type:'post',
			url:'/api/user/logout',
			success:function(result){

				if(!result.code){
					//退出成功
					window.location.reload();
				}
			}
		})
	})

})

 //回车提交事件
 $("body").keydown(function() {
     if (event.keyCode == "13") {//keyCode=13是回车键
         
        if($("#judge").val() == 'login'){
			$('#loginBtn').click();
		}else if($("#judge").val() == 'register'){
			$('#registerBtn').click();
		}
     }
 });


