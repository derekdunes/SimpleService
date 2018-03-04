
var express = require('express')
var url = require('url');
var	routes = require('./routes')
var	user = require('./routes/user')
var	http = require('http')
var	path = require('path');
//var contacts = require('./contacts');
var levelup = require('levelup');

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

var db = levelup('./contact', {valueEncoding: 'json'});
db.put('+359777123456', {
"firstname": "Joe",
"lastname": "Smith",
"title": "Mr.",
"company": "Dev Inc.",
"jobtitle": "Developer",
"primarycontactnumber": "+359777123456",
"othercontactnumbers": [
"+359777456789",
"+359777112233"],
"primaryemailaddress": "joe.smith@xyz.com",
"emailaddresses": [
"j.smith@xyz.com"],
"groups": ["Dev","Family"]
});	

app.get('/contacts/:number', function(request,resonse){
	console.log(request.url + ' : querying for ' + request.params.number);
	db.get(request.params.number,function(error,data){
		if (error) {
			response.writeHead(404,{
				'Content-Type' : 'text/plain'
			});
			response.end('None Found');
			return;
		}
		response.setHeader('content-type', 'application/json');
		resonse.send(data);
	});
	//response.setHeader('content-type', 'application/json');
	//response.end(JSON.stringify(contacts.query(request.params.number)));
});

// development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
console.log('Express server listening on port ' + app.get('port'));
});