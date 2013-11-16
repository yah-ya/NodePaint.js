var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs');
var clients = [];
var ss;

app.listen(80);


function handler (req, res) {
	if(req.url == "/"){
	fs.readFile('proje.html',
			function (err, data) {
			if (err) {
			    res.writeHead(500);
			    return res.end('Error loading proje.html');
			}

			res.writeHead(200);
			res.end(data);
	});
	}
	else{
		var str = req.url.substring(1, req.url.length); // strip the first slash
		
		fs.readFile(str,
				function (err, data) {
				if (err) {
				    res.writeHead(500);
				    return res.end('Error loading request ' + str);
				}

				res.writeHead(200);
				res.end(data);
		});
	}
}

io.sockets.on('connection', function (socket) {
	var cl = new Client(socket);
	ss = socket;
	  socket.on('userName', function (name) {
		    socket.set('userName', name);
		  });
	clients.push(cl);
});


function Client(socket) {
    this.socket = socket;
    var self = this;
    var nickName = null;
    this.socket.on('disconnect', function(){
    	deleteFromArray(socket.id);
    	getOnline(self);
    });
    
    this.socket.on('draw', function(data){
    	self.socket.broadcast.emit("draw", data);
    });
    
    this.socket.on('cursor', function(data){
    	self.socket.broadcast.emit("cursor", data);
    });
    
    this.socket.on('setting', function(data){
    	self.socket.broadcast.emit("setting", data);
    });
    
    this.socket.on('chat', function(data){
    	self.socket.broadcast.emit("chat", data);
    });
    
    
    this.socket.on('getPpl',function(data){
    	var names = [];
    	for (var socketId in io.sockets.sockets) {
    	    io.sockets.sockets[socketId].get('userName', function(err, userName) {
    	        names.push(userName);
    	    });
    	}
    	ss.emit("getPpl", names);
    });
    getOnline(self);
}

function deleteFromArray(element) {
	position = clients.indexOf(element);
	clients.splice(position, 1);
}

function getOnline(s){
	
	s.socket.emit("getOnline", clients.length+1);
	s.socket.broadcast.emit("getOnline", clients.length+1);
	
	
}


Client.prototype.send = function(data){
	this.socket.send(data);
} 




