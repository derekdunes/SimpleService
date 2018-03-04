
var express = require('express')
, url = require('url')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, morgan = require('mongoose')
, mongoose = require('mongoose')
, Grid = require('gridfs-stream')
, bodyParser = require('body-parser')
, jwt = require('jsonwebtoken')
, expressPaginate = require('express-paginate')
, mongoosePaginate = require('mongoose-paginate')
, CacheControl = require("express-cache-control")
, dataService = require('./contactDataService_1')
, dataService_v2 = require('./contactDataService_2')
, adminDataService = require('./contactAdminService')
, config = require('./config');

var app = express();

// all environments

app.set('port', process.env.PORT || 3000);
app.set('apiSecret', config.secret);
app.use(expressPaginate.middleware(5, 20));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(morgan('dev'));
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.methodOverride());
//app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(config.database);

var mongodb = mongoose.connection;

var authUserSchema = new mongoose.Schema({
	username: {type: String, index: {unique: true}},
	password: String,
	admin: Boolean
});

var contactSchema = new mongoose.Schema({
	primarycontactnumber : {type: String, index: {unique: true}},
	firstname : String,
	lastname : String,
	title : String,
	company : String,
	jobtitle : String,
	othercontactnumbers : [String],
	emailaddresses : String,
	primaryemailaddress : [String],
	groups : [String]
});

contactSchema.plugin(mongoosePaginate);

var cache = new CacheControl().middleware;
var Contact = mongoose.model('Contact', contactSchema);
var userAdmin = mongoose.model('Admin', authUserSchema);

//get an instance of the router for api routes
var apiRoutes = express.Router();

// verify user and generate token
apiRoutes.post('/authenticate', function(request, response){
	adminDataService.auth(userAdmin, request, response, jwt, app);
});

// create an admin and generate token
apiRoutes.post('/register', function(req, res){
	adminDataService.create(userAdmin, req, res, next, jwt, app);
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next){
	adminDataService.verify(req, res, next, jwt, app);
});

//route to return all users
apiRoutes.get('/users', function(request, response){
	userAdmin.find({}, function(err, users){
		response.json(users);
	})
});

//Deletes admin from database
apiRoutes.delete('/users',function(request, response){
	var get_params = url.parse(request.url, true).query;
	console.log(get_params);
	if (Object.keys(get_params).length == 0) {
		//dataService_v2.list(Contact,response);
		//dataService_v2.paginate(Contact, request, response);
	}else{
		userAdmin.findOne({username: get_params['username']},
			function(error, data){
				if (error) {
					console.log(error);
					if (response != null) {
						response.writeHead(500, {'Content-Type' : 'text/plain'});
						response.end('Interval server error');
					}
					return;
				}else{
					if (!data) {
						console.log('Not Found');
						if (response != null) {
							response.writeHead(404, {'Content-Type' : 'text/plain'});
							response.end('Not Found');
						}
						return;
					}else{
						data.remove(function(error){
							if (!error) {
								data.remove();
							}else{
								console.log(error);
							}
						});
						if (response != null) {
							response.send('Deleted');
						}
						return;
					}
				}
			});
	}
});

apiRoutes.get('/v1/contacts/:number', function(request,response){
	console.log(request.url + ' : querying for ' + request.params.number);
	dataService.findByNumber(Contact, request.params.number,response);
});

apiRoutes.get('/v2/contacts/:number', function(request,response){
	console.log(request.url + ' : querying for ' + request.params.number);
	dataService_v2.findByNumber(Contact, request.params.number,response);
});

apiRoutes.get('/v1/contacts', function(request, response){
	console.log('Listing all contacts with ' + request.params.key + '=' + request.params.value);
	dataService.list(Contact, response);
});

apiRoutes.get('/v2/contacts',function(request, response){
	
	var get_params = url.parse(request.url, true).query;
	console.log(get_params);
	
	if (Object.keys(get_params).length == 0) {
		//dataService_v2.list(Contact,response);
		dataService_v2.paginate(Contact, request, response);
	}else{
		if (get_params['limit'] != null || get_params['page'] != null){
			dataService_v2.paginate(Contact, request, response);
		}else{
			dataService_v2.query_by_arg(Contact,get_params, response);	
		}
	}
});

apiRoutes.get('/contacts', cache('minutes',1), function(request, response){
	var get_params = url.parse(request.url, true).query;

	if(Object.keys(get_params).length == 0){
		dataService.list(Contact, response);
	}else{
		dataService.query_by_arg(Contact, get_params, response);
	}

});

apiRoutes.post('/v1/contacts', function(request,response){
	dataService.update(Contact, request.query, response);
});

apiRoutes.post('/v2/contacts', function(request,response){
	console.log(request.query);
	dataService_v2.update(Contact, request.query, response);
});

apiRoutes.put('/v1/contacts', function(request, response){
	dataService.create(Contact, request.query, response);
});

apiRoutes.put('/v2/contacts', function(request, response){
	dataService_v2.create(Contact, request.query, response);
});

apiRoutes.delete('/v2/contacts/:primarycontactnumber', function(request,response){
	console.log(request.params.primarycontactnumber);
	dataService_v2.remove(Contact, request.params.primarycontactnumber, response);
});

apiRoutes.get('/v2/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.getImage(gfs, request.params.primarycontactnumber, response);
});

apiRoutes.get('/v1/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.getImage(gfs, request.params.primarycontactnumber, response);
});

apiRoutes.post('/v2/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.updateImage(gfs, request, response);
});

apiRoutes.post('/v1/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.updateImage(gfs, request, response);
});

apiRoutes.put('/v2/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.updateImage(gfs, request, response);
});

apiRoutes.put('/v1/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.updateImage(gfs, request, response);
});

apiRoutes.delete('/v2/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.deleteImage(gfs, mongodb.db, request.params.primarycontactnumber, response);
});

apiRoutes.delete('/v1/contacts/:primarycontactnumber/image', function(request, response){
	var gfs = Grid(mongodb.db,mongoose.mongo);
	dataService_v2.deleteImage(gfs, mongodb.db, request.params.primarycontactnumber, response);
});

app.use('/api', apiRoutes);

// development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
console.log('Express server listening on port ' + app.get('port'));
});