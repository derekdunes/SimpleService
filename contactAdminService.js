exports.create = function(userAdmin, req, res, next, jwt, app){
	userAdmin.findOne({username: req.query.username},
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
					//create a sample user
					var user = new userAdmin({
						username: req.query.username,
						password: req.query.password,
						admin: true
					});
					
					user.validate(function(err){
						console.log(err);
					});
					
					//save the sample user
					user.save(function(err){
						if(err) throw err;

						console.log('User save succesfully');
						tokenizer(res, jwt);
						//res.json({success: true});
					});

				}else{
					//user already exist
					if (response != null) {
						console.log('user already exist');
						response.send('Your account already exist');
					}
					return;
				}
			}
		});
}

exports.verify = function(req, res, next, jwt, app){

    var token = req.body.token || req.query.token || req.headers['x-access-token']; 
	
	//decode token
	if(token){

		//verify secret and check expiration time
		jwt.verify(token, app.get('apiSecret'), function(err, decode){
			if(err){
				return res.json({ succes: false, message: 'Failed to authentic token.'});
			} else {
				// if everything is good, save to request for use in others routes
				req.decode = decode;
				next();
			}
		});
	} else {
		//if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
} 

exports.auth = function(userAdmin, request, response, jwt, app){
	
	userAdmin.findOne({username: request.query.username},
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
					if (response != null) {
						response.writeHead(404, {'Content-Type' : 'text/plain'});
						response.end('Authentication failed. User Not Found');
					}
					return;
				}else if(data){
					//check if password matches
					if(data.password != request.query.password){
						response.json({success: false, message: 'Authentication failed. Wrong password.' });
					} else {
						const payload = {
							admin: data.admin
						};

						tokenizer(response, jwt);
					}

				}
			}
		});
}

function tokenizer(response, jwt){
	
	var token = jwt.sign(payload, app.get('apiSecret'), {
		expiresIn: "7d"
	});

	response.json({
		succes: true,
		message: 'Enjoy your token!',
		token: token
	});

}