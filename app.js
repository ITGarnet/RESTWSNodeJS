var restify = require('restify');
var mongojs = require("mongojs");

// creating a new server using the restify API

var ip_addr = '127.0.0.1';
var port 	= '8080';

var server = restify.createServer({
	name: "LinkWS"
});

// the parser content will be always available in req.query
server.use(restify.queryParser());

//The bodyParser turns the request data into a JavaScript object on the server automatically.
server.use(restify.bodyParser()); 

// Configure Cross-origin resource sharing CORS support in the application.
// CORS) is a mechanism that allows JavaScript on a web page to make 
// XMLHttpRequests to another domain, not the domain the JavaScript 
// originated from.[1] Such "cross-domain" requests would otherwise be 
// forbidden by web browsers, per the same origin security policy. 
// CORS defines a way in which the browser and the server can interact 
// to determine whether or not to allow the cross-origin request.[2] It 
// is more useful than only allowing same-origin requests, but it is 
// more secure than simply allowing all such cross-origin requests.
server.use(restify.CORS()); 

var connection_string = '127.0.0.1:27017/LinkWS';
var db = mongojs(connection_string, ['LinkWS']);
var events = db.collection("events");

// routes
var PATH = '/events'
server.get({path:PATH, version:'0.0.1'}, findAllEvents);
server.get({path:PATH + '/:eventId', version : '0.0.1'}, findEvent);
server.post({path:PATH, version:'0.0.1'}, postNewEvent);
server.del({path:PATH +'/:eventId', version: '0.0.1'}, deleteEvent);


function findAllEvents(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	events.find().limit(20).sort({postedOn : -1}, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(200, success);
			return next();
		} 
		return next(err);
	});
}

function findEvent(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	events.findOne({_id:mongojs.ObjectId(req.params.eventId)}, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(200, success);
			return next();
		}
		return next(err);
	});
}

function postNewEvent(req, res, next) {
	var event = {};
	event.title = req.params.title;
	console.log('Title is ' + event.title);
	event.description = req.params.description;
	event.location = req.params.location;
	event.postedOn = new Date();
	
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	events.save(event, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(201, event);
			return next();
		}
		return next(err);
	});
}

function deleteEvent(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	events.remove({_id:mongojs.ObjectId(req.params.eventId)}, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(204);
			return next();
		}
		return next(err);	
	});
}

server.listen(port, ip_addr, function() {
	console.log('%s listening at %s ', server.name, server.url);
});

