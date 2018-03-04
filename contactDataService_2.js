exports.paginate = function (model, request, response) {
	
	model.paginate({}, { page: request.query.page, limit: request.query.limit }, function(error, contacts){
		
		if(error){
			console.error(error);
			response.writeHead(500, {
				'Content-Type' : 'text/plain'
			});
			respond.end('Internal Server error');
			return;
		}

		response.json({
			Object: 'contacts',
			pageCount: contacts.pages,
			itemCount: contacts.limit,
			data: contacts.docs
		});
		
	});
}

exports.remove = function (model, phoneNumber, response){
	console.log('Deleting contact with primary number: ' + phoneNumber);
	
	//locate user date using their phone number
	model.findOne({primarycontactnumber: phoneNumber},
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

exports.updateImage = function(gfs, request, response){
	console.log(request.params.primarycontactnumber);
	var primarycontactnumber = request.params.primarycontactnumber;
	console.log('Updating image for primary contact number: ' + primarycontactnumber);
	request.pipe(gfs.createWriteStream({
		_id : primarycontactnumber,
		filename : 'image',
		mode : 'w'
	}));
	response.send("Succesfully uploaded image for primary contact number: " + primarycontactnumber);
}

exports.getImage = function(gfs, primarycontactnumber, response){
	console.log('Requesting image for primary contact number: ' + primarycontactnumber);
	
	var imageStream = gfs.createReadStream({
		_id : primarycontactnumber,
		filename : 'image',
		mode : 'r'
	});

	imageStream.on('error', function(error){
		response.status('404').send('Not Found');
		return;
	});

	response.setHeader('Content-Type','image/jpeg');
	imageStream.pipe(response);
};

exports.deleteImage = function(gfs, mongodb, primarycontactnumber,response){
	console.log('Deleting image for primary contact number: ' + primarycontactnumber);
	var collection = mongodb.collection('fs.files');
	collection.remove({_id: primarycontactnumber, filename: 'image'}, function(error, contact){
			if(error){
				console.log(error);
				return;
			}

			if(contact === null){
				response.status('404').send('Not Found');
				return;
			}else{
				console.log('Succesfully deleted image for primary contact number: ' + primarycontactnumber);
			}
	});
	response.send('Succesfully deleted image for primary contact number: ' + primarycontactnumber);
}

exports.update = function(model, requestBody, response){
	console.log(requestBody.primarycontactnumber);
	var primaryNumber = requestBody.primarycontactnumber;
	model.findOne({primarycontactnumber: primaryNumber},
	function(error, data){
		if(error){
			console.log(error);
			if(response != null){
				response.writeHead(500,
					{'Content-Type': 'text/plain'});
				response.end('Internal server error');
			}
			return;
		}else{
			var contact = toContact(requestBody, model);

			contact.validate(function(err){
				console.log(err);
			})
			if(!data){
				console.log('Contact with primary number: '+ primarynumber 
					+ ' does not exist. The contact will be created.');
				contact.save(function(error){
					if(!error){
						contact.save();
					}
				});

				if (response != null) {
					response.writeHead(201,
						{'Content-Type': 'text/plain'});
					response.end('Created');
				}
				return;
			}
			//populate the document with the updated values

			data.firstname = contact.firstname;
			data.lastname = contact.lastname;
			data.title = contact.title;
			data.company = contact.company;
			data.jobtitle = contact.jobtitle;
			data.primarycontactnumber = contact.primarycontactnumber;
			data.othercontactnumbers = contact.othercontactnumbers;
			data.emailaddresses = contact.emailaddresses;
			data.primaryemailaddress = contact.primaryemailaddress;
			data.groups = contact.groups;
			
			// now save
			data.save(function (error){
				if (!error) {
					console.log('Succesfully updated contact with primary number: ' + primaryNumber);
					data.save();
				}else{
					console.log('error on save');
				}
			});
			if(response != null){
				response.send('Updated');
			}
		}
	});
};

exports.create = function (model, requestBody, response){
	var contact = toContact(requestBody, model);
	
	//validate query data
	contact.validate(function(err){
		console.log(err);
	});
	
	var primarynumber = requestBody.primarycontactnumber;
	contact.save(function(error){
		if (!error) {
			contact.save();
		}else{
			console.log('Checking if contact saving failed due to already existing primary number: ' + primarynumber);
			model.findOne({primarycontactnumber: primarynumber},
			function(error, data){
				if (error) {
					console.log(error);
					if (response != null) {
						response.writeHead(500,
							{'Content-Type' : 'text/plain'});
						response.end('Internal server error');
					}
					return;
				}else{
					var contact = toContact(requestBody, model);
					if(!data){
						console.log('The contact does not exist. It will be created');
						Contact.save(function(error){
							if (!error) {
								contact.save();
							}else{
								console.log(error);
							}
						});

						if (response != null) {
							response.writeHead(201,
								{'Content-Type': 'text/plain'});
							response.end('Created');
						}
						return;
					}else {
						console.log('Updating contact with primary contact number: ' + primarynumber);

						data.firstname = contact.firstname;
						data.lastname = contact.lastname;
						data.title = contact.title;
						data.company = contact.company;
						data.jobtitle = contact.jobtitle;
						data.primarycontactnumber = contact.primarycontactnumber;
						data.othercontactnumbers = contact.othercontactnumbers;
						data.emailaddresses = contact.emailaddresses;
						data.primaryemailaddress = contact.primaryemailaddress;
						data.groups = contact.groups;

						data.save(function(error){
							if (!error) {
								data.save();
								response.end('Updated');
								console.log('Successfully Updated contact with primary contact number: ' + primarynumber);
							}else{
								console.log('Error while saving contact with primary contact number: ' + primarynumber);
								console.log(error);
							}
						});
					}
				}
			});
		}
	})
};

exports.findByNumber = function(model, _primaryContactNumber,response){
	model.findOne({primarycontactnumber: _primaryContactNumber},
		function(error, result){
			if (error) {
				console.log(error);
				response.writeHead(500,{'Content-Type' : 'text/plain'});
				response.end('Internal server error');
				return;
			}else{
				if (!result) {
					if (response != null) {
						response.writeHead(404, {'Content-Type' : 'text/plain'});
						response.end('Not Found');
					}
					return;
				}
				if (response != null) {
					response.setHeader('content-type','application/json');
					response.end(JSON.stringify(result));
				}
				console.log(result);
			}
			
		});
}

exports.list = function(model, response){
	model.find({}, function(error, result){
		if (error) {
			console.log(error);
			return null;
		}
		if(response != null){
			response.setHeader('content-type', 'application/json');
			response.end(JSON.stringify(result));
		}
		return JSON.stringify(result);
	});
}

exports.query_by_arg = function (model, get_params, response){
	//build a JSON string with the attribute and the value
	var filter;

	if (Object.keys(get_params).length == 1) {
		var key = Object.keys(get_params)[0];
		var value = get_params[key];

		var filterArg = '{\"'+key+ '\":' + '\"' + value + '\"}';
		filter = JSON.parse(filterArg);

	}else if(Object.keys(get_params).length == 2){
		var key1 = Object.keys(get_params)[0];
		var key2 = Object.keys(get_params)[1];
		var value1 = get_params[key1];
		var value2 = get_params[key2];

		var filterArgTest = '{\"' + key1 + '\":' + '\"' + value1 + '\",\"' + key2 + '\":' + '\"' + value2 + '\"}';
		var filter = JSON.parse(filterArgTest);


	}else if (Object.keys(get_params).length == 3) {
		var key1 = Object.keys(get_params)[0];
		var key2 = Object.keys(get_params)[1];
		var key3 = Object.keys(get_params)[2];
	
		var value1 = get_params[key1];
		var value2 = get_params[key2];
		var value3 = get_params[key3];

		var filterArgTest = '{\"' + key1 + '\":' + '\"' + value1 + '\",\"' + key2 + '\":' + '\"' + value2 + '\",\"' + key3 + '\":' + '\"' + value3 + '\"}';
		var filter = JSON.parse(filterArgTest);
	}else{
		response.writeHead(501, {'Content-Type' : 'text/plain'});
		response.end('Query Limit Exceeded');
	}

	console.log(filter);
	
	model.find(filter, function(error, result){
		if (error) {
			console.log(error);
			response.writeHead(500, {'Content-Type' : 'text/plain'});
			response.end('Internal server error');
			return;
		}else{
			if (!result) {
				if (response != null) {
					response.writeHead(404, {'Content-Type' : 'text/plain'});
					response.end('Not Found');
				}
				return;
			}
			if (response != null) {
				response.setHeader('Content-Type', 'application/json');
				response.send(JSON.stringify(result));
			}
		}
	});
};


function toContact(body, Contact){
	return new Contact({
		firstname : body.firstname,
		lastname : body.lastname,
		title : body.title,
		company : body.company,
		jobtitle : body.jobtitle,
		primarycontactnumber : body.primarycontactnumber,
		othercontactnumbers : body.othercontactnumbers,
		emailaddresses : body.emailaddresses,
		primaryemailaddress : body.primaryemailaddress,
		groups : body.groups
	});
}
