
var prepage = 2;	//每页条数
var page = 1;	//当前页数
var pages = 0;	//总页数
var comments = [];	//评论列表

var user = $('#userInfoId').val();	//当前用户
var author = $('#authorId').val();	//文章作者
var receiverId='';
var receiverName='';

//JS正则处理文章内容
$(function(){
	var str = $("#Content").val();
    var reg=new RegExp("＜br＞","g");
	stt= str.replace(reg,"\r\n");
    $('.post-content').html(stt);
});	

//事件委托
$('.pager').delegate('a','click',function(){
	if($(this).parent().hasClass('previous')){
		page--;	//上一页
	}else{
		page++;	//下一页
	}
	renderComment();
});

//每次页面刷新重载的时候获取一下该文章的所有评论
$.ajax({
	url:'/api/comment',
	data:{
		articalId:$('#ArticalId').val()
	},
	success:function(responseData){	
		$('.commentCount').html(responseData.articalComments);
		comments = responseData.data.reverse();
		renderComment();
	}
});

//提交评论
$('#comBtn').on('click',function(){

	var content = $('#comment').val();
	if( content == '' ){
		//评论内容为空
		$('.comWarning').html('<b>评论不能为空！</b>')
	}else{
		$('.comWarning').html('')
		$.ajax({
			type:'POST',
			url:'/api/comment/post',
			data:{
				authorId:author,
				articalId:$('#ArticalId').val(),
				content:$('#comment').val()
			},
			success:function(responseData){
				$('#comment').val('');
				$('.commentCount').html(responseData.articalComments);
				comments = responseData.data.reverse();
			    renderComment();
			}
		})
	}	
});

//回复功能
$('.list-group').delegate('button','click',function(){

	if( $(this).hasClass('noreply') ){
		//评论中无回复的btn
		var id = $(this).parent().parent().prev().find(':hidden').val();
		var replyComment = $(this).parent().parent().find('textarea').val();

		if(replyComment == ''){
			$(this).prev().show()
		}else{
			$(this).prev().hide()

			$.ajax({
				type:'POST',
				url:'/api/comment/reply',
				data:{
					authorId:author,
					CommentId:id,
					replyComment:replyComment,
					articalId:$('#ArticalId').val()
				},
				success:function(responseData){
					replyComment = '';
					$('.commentCount').html(responseData.articalComments);
					comments = responseData.data.reverse();
				    renderComment();
				}
			})
		}

	}else{
		//评论中有回复的btn
		var id = $(this).parent().parent().parent().prev().find(':hidden').val();
		var replyComment = $(this).parent().parent().find('textarea').val();

		if(replyComment == ''){
			$(this).prev().show()
		}else{
			$(this).prev().hide()

			$.ajax({
				type:'POST',
				url:'/api/comment/reply',
				data:{
					authorId:author,
					receiverId:receiverId,
					receiverName:receiverName,
					CommentId:id,
					replyComment:replyComment,
					articalId:$('#ArticalId').val()
				},
				success:function(responseData){
					replyComment = '';
					receiver = '';
					$('.commentCount').html(responseData.articalComments);
					comments = responseData.data.reverse();
				    renderComment();
				}
			})
		}
	}

})


$('.list-group').delegate('a','click',function(){

	if($(this).hasClass('reply')){
		//var id = $(this).parent().find(':hidden').val();

		//显示隐藏单条评论列表
		if($(this).parent().hasClass('more')){
			$(this).parent().removeClass('more');
			$(this).parent().next().hide();
		}else{
			$(this).parent().addClass('more');
			$(this).parent().next().show();
		}

	}else if($(this).hasClass('delete')){
		//删除单条评论
		var id = $(this).parent().find(":hidden").val();

		$.ajax({
			url:'/api/comment/delete',
			data:{
				CommentId:id,
				authorId:author,
				articalId:$('#ArticalId').val()
			},
			success:function(responseData){
				$('.commentCount').html(responseData.articalComments);
				comments = responseData.data.reverse();
			    renderComment();
			}
		})
	}else if( $(this).hasClass('adminDelete') ){
		//删除单条评论中的某条回复
		var id = $(this).parent().parent().parent().parent().parent().last().find(":hidden").val();
		var index = $(this).parent().parent().index();

		$.ajax({
			url:'/api/comment/reply/delete',
			data:{
				CommentId:id,
				authorId:author,
				index:index,
				articalId:$('#ArticalId').val()
			},
			success:function(responseData){
				$('.commentCount').html(responseData.articalComments);
				comments = responseData.data.reverse();
			    renderComment();
			}
		})
	}else if( $(this).hasClass('adminReply') ){
		//回复单条评论中的某条回复
		
		if( $(this).parent().parent().parent().next().next().hasClass('hideBox') ) {
			$(this).parent().parent().parent().next().next().removeClass('hideBox')
		}

		receiverName = $(this).parent().prev().find('a').html();
		Id = $(this).parent().prev().find('a').attr('href');
		//获取href上的id
		var m =Id.length;
		var n = Id.indexOf('=');
		receiverId = Id.substring(n+1,m);

		$(this).parent().parent().parent().parent().find('textarea').val(' 回复 '+ receiverName +' : ');

	}else{
		//显示隐藏回复textarea盒子
		if( $(this).next().hasClass('hideBox') ){
			$(this).next().removeClass('hideBox')
		}else{
			$(this).next().addClass('hideBox')
		}
	}
	
});

//刷新评论
function renderComment(){
	receiverId='';
	receiverName='';
	var length = comments.length;
	pages = Math.max( Math.ceil(comments.length / prepage),1);

	if(page > pages){page --}

	var start = Math.max(page-1)*prepage;
	var end = Math.min(start+prepage,comments.length);

	var $lis = $('.pager li');
	$lis.eq(1).html( '第 '+page+' 页'+' / '+'共 '+pages+' 页');

	if(comments.length == 0){
		$('.commentlist').hide();
		$('.nocomment').show();
		$('.commentCount').html(0);

		$lis.eq(0).html( '<span>没有上一页</span>');
		$lis.eq(2).html( '<span>没有下一页</span>');

	}else{
		$('.nocomment').hide();
		$('.commentlist').show();

		//上一页
		if( page <= 1){
			page = 1;
			$lis.eq(0).html( '<span>没有上一页</span>');
		}else{
			$lis.eq(0).html( '<a href="javascript:;">上一页</a>');
		}
		//下一页
		if( page >= pages){
			page = pages;
			$lis.eq(2).html( '<span>没有下一页</span>');

		}else{	
			$lis.eq(2).html( '<a href="javascript:;">下一页</a>');
		}

		var html = '';
		for (var i=start; i<end; i++){
			//评论列表为空
			if(comments[i].replyList == ''){
				//用户为文章作者
				if(user == author){
					html += '<li class="list-group-item">' +
						'<div class="topbox">' +
							'<span class="f-left"><b><a href="/Info?Id='+comments[i].commentUserId+'">' + comments[i].commentUserName +'</a></b></span>' +
							'<span class="f-right">' + formatDate(comments[i].postTime) + '</span>' +
						'</div>'+
						'<div class="contentBox">' +comments[i].content+ '</div>' +
						'<a class="delete" href="javascript:;">删除</a>'+
						'<div class="bottombox">'+
							'<a class="reply" href="javascript:;">回复</a>' +
							'<input class="number" type="hidden" value="'+comments[i]._id.toString()+'"></input>'+
						'</div>' +
						'<div class="replybox" style="display:none">'+
							'<textarea type="text" id="reply" class="textareaBox"></textarea>'+
							'<div class="answerbox">'+
							'<div class="noReplyContent">回复内容不能为空！</div>' +
							'<button class="btn btn-primary btn-sm noreply" id="replyBtn" style="float:right">发表</button>' +
							'</div>'+
							'</div>'+
						'</li>'
				//无用户登录
				}else if(user == ''){
					html += '<li class="list-group-item">' +
						'<div class="topbox">' +
							'<span class="f-left"><b><a href="/Info?Id='+comments[i].commentUserId+'">' + comments[i].commentUserName +'</a></b></span>' +
							'<span class="f-right" style="color:#999">' + formatDate(comments[i].postTime) + '</span>' +
						'</div>'+
						'<div class="contentBox"><span>' +comments[i].content+ '</span></div>' +
						'</li>'
				//一般用户登录
				}else{
					html += '<li class="list-group-item">' +
						'<div class="topbox">' +
							'<span class="f-left"><b><a href="/Info?Id='+comments[i].commentUserId+'">' + comments[i].commentUserName +'</a></b></span>' +
							'<span class="f-right" style="color:#999">' + formatDate(comments[i].postTime) + '</span>' +
						'</div>'+
						'<div class="contentBox">' +comments[i].content+ '</div>' +
						'<div class="bottombox">'+
							'<a class="reply" href="javascript:;">回复</a>' +
							'<input class="number" type="hidden" value="'+comments[i]._id.toString()+'"></input>'+
						'</div>' +
						'<div class="replybox" style="display:none">'+
							'<textarea type="text" id="reply" class="textareaBox"></textarea>'+
							'<div class="answerbox">'+
							'<div class="noReplyContent">回复内容不能为空！</div>' +
							'<button class="btn btn-primary btn-sm noreply" id="replyBtn" style="float:right">发表</button>' +
							'</div>'+
							'</div>'+
						'</li>'
				}

			//评论列表不为空
			}else{	
				//用户为文章作者
				if(user == author){
					var replylisthtml = '';
					var replylisthtmls = '';
					for (var j=0; j<comments[i].replyList.length; j++){

						if(comments[i].replyList[j].replyUserId == user){
							replylisthtml += '<li class="list-group-item replylist">' +
												'<div class="topbox">' +
													'<strong><a href="/Info?Id='+comments[i].replyList[j].replyUserId+'">' + comments[i].replyList[j].replyUsername +'</a></strong>'+
													'<span> : '+comments[i].replyList[j].replyComment+'</span>' +
												'</div>'+
												'<div class="contentBox text-right"><span class="time">'  + formatDate(comments[i].replyList[j].replyTime) + '</span>'+
													'<a class="adminDelete" href="javascript:;">删除</a>'+
												'</div>' +
											 '</li>' 

						}else{
							replylisthtml += '<li class="list-group-item replylist">' +
											'<div class="topbox">' +
												'<strong><a href="/Info?Id='+comments[i].replyList[j].replyUserId+'">' + comments[i].replyList[j].replyUsername +'</a></strong>'+
												'<span> : '+comments[i].replyList[j].replyComment+'</span>' +
											'</div>'+
											'<div class="contentBox text-right"><span class="time">'  + formatDate(comments[i].replyList[j].replyTime) + '</span>'+
												'<a class="adminDelete" href="javascript:;">删除</a>'+'|'+'<a class="adminReply" href="javascript:;">回复</a>'+
											'</div>' +
											'</li>' 
						}
						
					}
					replylisthtmls = '<ul class="list-group">' + replylisthtml + '</ul>'

					html += '<li class="list-group-item">' +
								'<div class="topbox">' +
									'<span class="f-left"><b><a href="/Info?Id='+comments[i].commentUserId+'">' + comments[i].commentUserName +'</a></b></span>' +
									'<span class="Time">' + formatDate(comments[i].postTime) + '</span>' +
								'</div>'+
								'<div class="contentBox">' +comments[i].content+ '</div>' +
								'<a class="delete" href="javascript:;">删除</a>'+
								'<div class="bottombox more">'+
									'<a class="reply" href="javascript:;">回复('+ comments[i].replyList.length +')</a>' +
									'<input class="number" type="hidden" value="'+comments[i]._id.toString()+'"></input>'+
								'</div>' +
								'<div class="replybox">'+replylisthtmls+
									'<a class="btn btn-primary btn-sm" style="float:right;margin-bottom:20px">我也说一句</a>' +
									'<div class="hideBox">' +
										'<textarea type="text" id="reply" class="textareaBox"></textarea>'+
										'<div class="answerbox">'+
											'<div class="noReplyContent">回复内容不能为空！</div>' +
											'<button class="btn btn-primary btn-sm" id="replyBtn" style="float:right">发表</button>' +
										'</div>'+
									'</div>'+
								'</div>'+
							'</li>'
				//无用户登录
				}else if(user == ''){

					var replyListHtml = '';
					var replyListHtmls = '';
					for (var j=0; j<comments[i].replyList.length; j++){
						replyListHtml += '<li class="list-group-item replylist">' + 
											'<div class="topbox">' +
												'<strong><a href="/Info?Id='+comments[i].replyList[j].replyUserId+'">' + comments[i].replyList[j].replyUsername +'</a></strong>'+
												'<span> : '+comments[i].replyList[j].replyComment+'</span>' +
											'</div>'+
											'<div class="contentBox text-right"><span style="font-size:12px;color:#999;margin-right:10px">'  + formatDate(comments[i].replyList[j].replyTime) + '</span></div>' +
										'</li>' 
					}
					replyListHtmls = '<ul class="list-group">' + replyListHtml + '</ul>'

					html += '<li class="list-group-item">' +
						'<div class="topbox">' +
							'<span class="f-left"><b><a href="/Info?Id='+comments[i].commentUserId+'">' + comments[i].commentUserName +'</a></b></span>' +
							'<span class="Time">' + formatDate(comments[i].postTime) + '</span>' +
						'</div>'+
						'<div class="contentBox"><span>' +comments[i].content+ '</span></div>' +
						'<div class="bottombox more">'+
							'<a class="reply" href="javascript:;">回复('+ comments[i].replyList.length +')</a>' +
						'</div>' +
						'<div class="replybox">'+replyListHtmls+
						'</div>'+
						'</li>'
				//一般用户登录
				}else{

					var replylisthtml = '';
					var replylisthtmls = '';
					for (var j=0; j<comments[i].replyList.length; j++){

						if(comments[i].replyList[j].replyUserId == user){
							replylisthtml += '<li class="list-group-item replylist">' +
												'<div class="topbox">' +
													'<strong><a href="/Info?Id='+comments[i].replyList[j].replyUserId+'">' + comments[i].replyList[j].replyUsername +'</a></strong>'+
													'<span> : '+comments[i].replyList[j].replyComment+'</span>' +
												'</div>'+
												'<div class="contentBox text-right"><span class="time">'  + formatDate(comments[i].replyList[j].replyTime) + '</span>'+
												'</div>' +
											 '</li>' 

						}else{
							replylisthtml += '<li class="list-group-item replylist">' +
											'<div class="topbox">' +
												'<strong><a href="/Info?Id='+comments[i].replyList[j].replyUserId+'">' + comments[i].replyList[j].replyUsername +'</a></strong>'+
												'<span> : '+comments[i].replyList[j].replyComment+'</span>' +
											'</div>'+
											'<div class="contentBox text-right"><span class="time">'  + formatDate(comments[i].replyList[j].replyTime) + '</span>'+
												'<a class="adminReply" href="javascript:;">回复</a>'+
											'</div>' +
											'</li>' 
						}
						
					}
					replylisthtmls = '<ul class="list-group">' + replylisthtml + '</ul>'

					html += '<li class="list-group-item">' +
						'<div class="topbox">' +
							'<span class="f-left"><b><a href="/Info?Id='+comments[i].commentUserId+'">' + comments[i].commentUserName +'</a></b></span>' +
							'<span class="Time">' + formatDate(comments[i].postTime) + '</span>' +
						'</div>'+
						'<div class="contentBox">' +comments[i].content+ '</div>' +
						'<div class="bottombox more">'+
							'<a class="reply" href="javascript:;">回复('+ comments[i].replyList.length +')</a>' +
							'<input class="number" type="hidden" value="'+comments[i]._id.toString()+'"></input>'+
						'</div>' +
						'<div class="replybox">'+replylisthtmls+
							'<a class="btn btn-primary btn-sm" style="float:right;margin-bottom:20px">我也说一句</a>' +
							'<div class="hideBox">' +
								'<textarea type="text" id="reply" class="textareaBox"></textarea>'+
								'<div class="answerbox">'+
									'<div class="noReplyContent">回复内容不能为空！</div>' +
									'<button class="btn btn-primary btn-sm" id="replyBtn" style="float:right">发表</button>' +
								'</div>'+
							'</div>'+
						'</div>'+
						'</li>'
				}
			}
			
			$('.list-group').html(html);
		}
	}

};
