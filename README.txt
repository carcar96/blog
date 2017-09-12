
运行步骤：
	1、打开cmd -->cd "mongodb中bin的安装路径"( E:MongoDB\Bin ) -->回车确认
	2、输入 mongod --dbpath="数据db的位置"( C:\Users\pc\Desktop\blog\db ) --port=27018( 端口：27018 ) -->回车确认
	3、另外打开cmd -->cd "文件app.js的上一层目录"( C:\Users\pc\Desktop\blog ) -->回车确认
	4、输入 node app.js

E:
cd E:MongoDB\Bin
mongod --dbpath=C:\Users\pc\Desktop\blog\db --port=27018
cd C:\Users\pc\Desktop\blog
node app.js