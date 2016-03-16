var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);  //引入socket.io模块，并绑定在服务器上
var port = process.env.PORT || 3000;
app.use('/', express.static(__dirname + '/www'));
server.listen(port);
console.log('开始');
// socket部分
var users = [];
io.on('connection', function (socket) {    // io表示服务器所有socket连接; socket表示的是当前连接到服务器的那个客户端
	// socket.on('message', function (data) {   // 接收并处理客户端发送的foo事件
	// 	console.log(data);
	// });
	// io.emit('message0', 'lala');
	

	// 昵称设置
	socket.on('login', function (nick) {
		if (users.indexOf(nick) > -1) {
			socket.emit('nickExisted');    // 只有当前的客户端自己接收到
			// socket.broadcast.emit('XXX');   // 表示想除自己外的所有人发送该事件
		} else {
			socket.userIndex = users.length;   // 该用户在数组中的索引
			socket.nick = nick;
			users.push(nick);	 // 加入在线用户数组
			console.log(users);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nick, '登录', socket.userIndex, users);    // 向所有连接到服务器的客户端都发送当前登录用户的昵称
		}
	});
	socket.on('disconnect', function () {
		users.splice(socket.userIndex, 1);   // 将断开连接的用户从users数组中移除
		socket.broadcast.emit('system', socket.nick, '退出', socket.userIndex);   //发送给除当前用户以外的所有用户
	});
	socket.on('sendMsg', function (msg, color) {
		socket.broadcast.emit('newMsg', socket.nick, msg, color);
	});
	socket.on('img', function (imgUrl) {
		socket.broadcast.emit('newImg', socket.nick, imgUrl);
	});
});