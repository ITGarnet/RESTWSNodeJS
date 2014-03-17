var restify = require('restify');
var mongojs = require("mongojs");

// creating a new server using the restify API

var ip_addr = '127.0.0.1';
var port 	= '8080';

var server = restify.createServer({
	name: "TzikiWS"
});

server.use(restify.queryParser()); // the parser content will be always available in req.query

server.use(restify.bodyParser()); // it turns the request data into a JavaScript object on the server automatically.

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

var connection_string = '127.0.0.1:27017/TzikiWS';
var db = mongojs(connection_string, ['TzikiWS']);
var jobs = db.collection("jobs");

// routes
var PATH = '/jobs'
server.get({path:PATH, version:'0.0.1'}, findAllJobs);
server.get({path:PATH + '/:jobId', version : '0.0.1'}, findJob);
server.post({path:PATH, version:'0.0.1'}, postNewJob);
server.del({path:PATH +'/:jobId', version: '0.0.1'}, deleteJob);


function findAllJobs(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	jobs.find().limit(20).sort({postedOn : -1}, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(200, success);
			return next();
		} else {
			return next(err);
		}
	});
}

function findJob(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	jobs.findOne({_id:mongojs.ObjectId(req.params.jobId)}, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(200, success);
			return next();
		}
		return next(err);
	});
}


function postNewJob(req, res, next) {
	var job = {};
	job.title = req.params.title;
	console.log('Title is ' + job.title);
	job.description = req.params.description;
	job.location = req.params.location;
	job.postedOn = new Date();
	
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	jobs.save(job, function(err, success) {
		console.log('Response success ' + success);
		console.log('Response error ' + err);
		if(success) {
			res.send(201, job);
			return next();
		}
		return next(err);
	});
}


function deleteJob(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	jobs.remove({_id:mongojs.ObjectId(req.params.jobId)}, function(err, success) {
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

