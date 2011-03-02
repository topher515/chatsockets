var sys = require("sys"),
	http = require("http"),
	io = require("socket.io");

server = http.createServer(function(request,response) {
	response.writeHead(200,{"Content-Type":"text/html"});
	response.write("Hellow World!");
	response.end();
})
server.listen(8030);


var who = {}
var history = []

// socket.io
var socket = io.listen(server);
socket.on('connection', function(client) {
	
	var toclient = function(who,msg,id) {
		json = {'who':who,'msg':msg}
		if (id) json['id'] = id
		client.send(JSON.stringify(json))
	}
	var toeveryone = function(who,msg,id) {
		json = {'who':who,'msg':msg}
		if (id) json['id'] = id
		else json['id'] = client.sessionId
		client.broadcast(JSON.stringify(json))
	}
	
	// new client
	toclient('Server','You have connected to Chris\'s server')
	whoswho = [];
	for (i in socket.clients) { 
		if (who[i])
			whoswho.push(who[i]); 
		else
			whoswho.push(i)
	}
	
	toclient('Server','Also connected: '+ whoswho.join(", "))
	toeveryone('Server','Client connected: '+ client.sessionId)
	
	for (i in history) {
		toclient(history[i][0],history[i][1],history[i][2]);
	}
	
	client.on('message', function(msg) {
		
		
		m = JSON.parse(msg);
		
		// Save who this is for later
		who[client.sessionId] = m.who;
		
		// Broadcast message to everybody
		toeveryone(m.who,m.msg);
		
		// Save into history
		history.push([m.who,m.msg,client.sessionId]);
		
	})
	
	client.on('disconnect', function() {
		toeveryone('Server','Client disconnected: '+ client.sessionId)
	})
});

sys.puts('Server running...')