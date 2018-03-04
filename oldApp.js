
var express = require('express')
, url = require('url')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, mongoose = require('mongoose')
, contacts = require('./contacts');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/hello',function(request,response){
	var get_params = url.parse(request.url, true).query;
	if (Object.keys(get_params).length == 0) {
		response.end('Hello all');
	}else{
		response.end('Hello ' + get_params.name);
	}
});	

app.get('/hello/:name',function(request,response){
	response.send('Hello ' + request.params.name);
});

app.get('/contacts',function(request, response){
	var get_params = url.parse(request.url, true).query;
	
	if (Object.keys(get_params).length == 0) {
		response.setHeader('content-type', 'application/json');
		response.end(JSON.stringify(contacts.list()));
	}else{
		response.setHeader('content-type', 'application/json');
		console.log(get_params);
		console.log(Object.keys(get_params).length);
		//response.end(JSON.stringify(contacts.query_by_arg('firstname', get_params.firstname)));
		//console.log(Object.keys(get_params));
		response.end(JSON.stringify(contacts.query_by_arg_new(get_params)));
	}
})

app.get('/contacts/:number', function(request,resonse){
	response.setHeader('content-type', 'application/json');
	response.end(JSON.stringify(contacts.query(request.params.number)));
});

app.get('/groups',function(request,response){
	console.log('groups');
	response.setHeader('content-type', 'application/json');
	response.end(JSON.stringify(contacts.list_groups()));
});

app.get('/groups/:name', function(request,response){
	console.log('groups');
	response.setHeader('content-type', 'application/json');
	response.end(JSON.stringify(contacts.get_members(request.params.name)));
});

// development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
console.log('Express server listening on port ' + app.get('port'));
});