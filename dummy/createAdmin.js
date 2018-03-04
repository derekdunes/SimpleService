
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
, config = require('./config');

var app = express();

// all environments

app.set('port', process.env.PORT || 3000);
app.set('apiSecret', config.secret);
app.use(expressPaginate.middleware(5, 20));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
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

app.get('/setup', function(req, res){

    //create a sample user
    var user = new userAdmin({
        name: 'Mbah Derek',
        password: 'password',
        admin: true
    });

    //save the sample user
    user.save(function(err){
        if(err) throw err;

        console.log('User save succesfully');
        res.json({success: true});
    });
});

// development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
console.log('Express server listening on port ' + app.get('port'));
});