// function formatDate(d){
// 	var date = new Date(d);
// 	//年
// 	 var year = date.getFullYear();
// 	 	//判断小于10，前面补0
// 	   if(year<10){
// 	 	year="0"+year;
// 	 }
	 
// 	 //月
// 	 var month = date.getMonth()+1;
// 	 	//判断小于10，前面补0
// 	  if(month<10){
// 		month="0"+month;
// 	 }
	 
// 	 //日
// 	 var day = date.getDate();
// 	 	//判断小于10，前面补0
// 	   if(day<10){
// 	 	day="0"+day;
// 	 }
	 
// 	 //时
// 	 var hours =date.getHours();
// 	 	//判断小于10，前面补0
// 	    if(hours<10){
// 	 	hours="0"+hours;
// 	 }
	 
// 	 //分
// 	 var minutes =date.getMinutes();
// 	 	//判断小于10，前面补0
// 	    if(minutes<10){
// 	 	minutes="0"+minutes;
// 	 }
	 
// 	 //秒
// 	 var seconds=date.getSeconds();
// 	 	//判断小于10，前面补0
// 	    if(seconds<10){
// 	 	seconds="0"+seconds;
// 	 }
	 
// 	 //拼接年月日时分秒
// 	 var date_str = year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
// 	 return date_str;
// }

function formatDate(d){
	var date = new Date(d);
	var s = (new Date().getTime()-date.getTime())/1000;
	var str = '';
	if(s<60){
		str = Math.ceil(s) + '秒前';
	}else if(s<60*60){
		s = Math.floor(s/60);
		str = s + '分钟前';
	}else if(s<60*60*24){
		s = Math.floor(s/(60*60));
		str = s + '小时前';
	}else if(s<60*60*24*30){
		s = Math.floor(s/(60*60*24));
		str = s + '天前';
	}else if(s<60*60*24*365){
		s = Math.floor(s/(60*60*24*30));
		str = s + '个月前';
	}else{
		s = Math.floor(s/(60*60*24*365));
		str = s + '年前';
	}
	return str;
}