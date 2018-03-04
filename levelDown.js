var express = require('express')
, http = require('http')
, path = require('path')
, bodyParser = require('body-parser')
, levelup = require('levelup')
, leveldown = require('leveldown');
//, logger = require('morgan')
//, methodOverride = require('method-override')
//, errorHandler = require('errorhandler')

var app = express();
var url = require('url');
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(methodOverride());
app.use(bodyParser.json());
//development only
if ('development' == app.get('env')) {
	//app.use(errorHandler());
}

var db = levelup(leveldown('./contact'),{valueEncoding: 'json'});

db.put('+359777123456',{
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

	app.get('/contacts/:number', function(request, response) {
		console.log(request.url + ' : querying for ' + request.params.number);

		db.get(request.params.number,function(error, data) {
			if (error) {
				response.writeHead(404, {'Content-Type' : 'text/plain'});
				response.end('Not Found');
				return;
			}
			console.log(data);
			response.setHeader('content-type', 'application/json');
			response.send(data);
		});
	});
	
	app.post('/contacts/:number', function(request, response){
		console.log('Adding new contact with primary number' + request.params.number);
		db.put(request.params.number, request.body, function(error){
			if(error){
				response.writeHead(500,{
					'Content-Type' : 'text/plain'
				});
			}
			response.send(request.params.number + ' succesfully inserted');
		});
	});

	app.del('/contacts/:number', function(request, response){
		console.log('Deleting contact with primary number' + request.params.number);
		db.del(request.params.number, function(error){
			if (error) {
				response.writeHead(500, {
					'Content-Type' : 'text/plain'
				});
				response.end('Interval server error');
				return;
			}
			response.send(request.params.number + ' succesfully deleted');
		});
	});
	app.get('contacts' function(request, response){
		console.log('Listing all contacts');
		var is_first = true;

		response.setHeader('content-type', 'application/json');
		db.createReadStream().on('data', function (data){
			console.log(data.value);
			if (is_first == true) {
				response.write('[');
			}else{
				response.write(',');
			}
			response.write(JSON.stringify(data.value));
			is_first = false
		}).on('error', function(error) {
			console.log('Error while reading', error);
		}).on('close', function() {
			console.log('Closing db stream');
		}).on('end', function() {
			console.log('Db stream closed');
			response.end(']');
		})
	});	

console.log('Running at port ' + app.get('port'));
http.createServer(app).listen(app.get('port'));

