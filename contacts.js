var fs = require('fs');

function read_json_file() {
	var file = './contacts.json';
	return fs.readFileSync(file);
}

exports.list = function() {
	return JSON.parse(read_json_file());
}

exports.query = function(number) {
	var json_result = JSON.parse(read_json_file());
	var result = json_result.result;
	for (var i = 0; i < result.length; i++) {
		var contact = result[i];
		if (contact.primarycontactnumber == number){
			return contact;
		}
	}
	return null;

}

exports.query_by_arg = function(arg, value) {
	var json_result = JSON.parse(read_json_file());
	var result = json_result.result;
	for (var i = 0; i < result.length; i++) {
		var contact = result[i];
		console.log('Argument:' + arg);
		console.log('Value ' + value);
		console.log('contact argument value ' + contact[arg]);
		if (contact[arg] == value) {
			//add contact to an json object
			return contact;
		}
	}
	//return json object generated
	return null;
}

exports.query_by_arg_new = function(arg){
	var json_result = JSON.parse(read_json_file());
	var result = json_result.result;

	if(Object.keys(arg).length == 1){

		if (arg.firstname != null) {
			
			var newContact = [];
			var count = 0;
			
			for (var i = 0; i < result.length; i++) {
				
				var contact = result[i];
				var value = arg.firstname;

				console.log('Argument:' + 'firstname');
				console.log('Value ' + value);
				console.log('contact argument value ' + contact['firstname']);
				
				if (contact['firstname'] == value) {
					newContact[count] = contact;
					count++;
				}
			}

			if (newContact != null) {
				return newContact;
				console.log(newContact);
			}else{
				return null;	
			}

		}else if (arg.lastname != null) {

			var newContact = [];
			var count = 0;
			
			for (var i = 0; i < result.length; i++) {
				
				var contact = result[i];
				var value = arg.lastname;

				console.log('Argument:' + 'lastname');
				console.log('Value ' + value);
				console.log('contact argument value ' + contact['lastname']);
				
				if (contact['lastname'] == value) {
					newContact[count] = contact;
					count++;
				}
			}

			if (newContact != null) {
				return newContact;
				console.log(newContact);
			}else{
				return null;	
			}

		}else if (arg.contactnumber != null) {

			var newContact = [];
			var count = 0;
			
			for (var i = 0; i < result.length; i++) {
				
				var contact = result[i];
				var value = arg.contactnumber;

				console.log('Argument:' + 'contactnumber');
				console.log('Value ' + value);
				console.log('contact argument value ' + contact['contactnumber']);
				
				if (contact['contactnumber'] == value) {
					newContact[count] = contact;
					count++;
				}
			}

			if (newContact != null) {
				return newContact;
				console.log(newContact);
			}else{
				return null;	
			}

		}else if (arg.jobtitle != null) {
			var newContact = [];
			var count = 0;
			
			for (var i = 0; i < result.length; i++) {
				
				var contact = result[i];
				var value = arg.jobtitle;

				console.log('Argument:' + 'jobtitle');
				console.log('Value ' + value);
				console.log('contact argument value ' + contact['jobtitle']);
				
				if (contact['jobtitle'] == value) {
					newContact[count] = contact;
					count++;
				}
			}

			if (newContact != null) {
				return newContact;
				console.log(newContact);
			}else{
				return null;	
			}
			
		}else if (arg.emailaddress != null){

			var newContact = [];
			var count = 0;
			
			for (var i = 0; i < result.length; i++) {
				
				var contact = result[i];
				var value = arg.emailaddress;

				console.log('Argument:' + 'emailaddress');
				console.log('Value ' + value);
				console.log('contact argument value ' + contact['emailaddress']);
				
				if (contact['emailaddress'] == value) {
					newContact[count] = contact;
					count++;
				}
			}

			if (newContact != null) {
				return newContact;
				console.log(newContact);
			}else{
				return null;	
			}
		}

	}else if(Object.keys(arg).length == 2){

	}else if (Object.keys(arg).length == 3) {

	}else if (Object.keys(arg).length == 4) {

	}else if(Object.keys(arg).length == 5){
		
		if (arg.firstname != null && arg.lastname != null && arg.contactnumber != null && arg.jobtitle != null && arg.emailaddress != null){
			
			for (var i = 0; i < result.length; i++) {
				var contact = result[i];

				var value = arg.emailaddress;
				var value1 = arg.lastname;
				var value2 = arg.firstname;
				var value3 = arg.contactnumber;
				var value4 = arg.jobtitle;

				console.log('Value ' + value);
				console.log('Value1 ' + value1);
				console.log('Value2 ' + value2);
				console.log('Value2 ' + value3);
				console.log('Value2 ' + value4);

				
				if (contact['emailaddress'] == value && contact['lastname'] == value1 && contact['firstname'] == value2 && contact['contactnumber'] == value3 && contact['jobtitle'] == value4) {
					return contact;
				}
			}
			return null;

		}else{
			return null;
		}

	}else {
		return null;
	}
}


exports.list_groups = function() {
	var json_result = JSON.parse(read_json_file());
	var result = json_result.result;
	var resultArray = new Array ();
	for (var i = 0; i < result.length; i++) {
		var groups = result[i].groups;
		for (var index = 0; index < groups.length; index++) {
			if (resultArray.indexOf(groups[index]) == -1) {
				resultArray.push(groups[index]);
			}
		}
	}
	return resultArray;
}

exports.get_members = function(group_name) {
	var json_result = JSON.parse(read_json_file());
	var result = json_result.result;
	var resultArray = new Array ();
	for (var i = 0; i < result.length; i++) {
		if (result[i].groups.indexOf(group_name) > -1) {
			resultArray.push(result[i]);
		}
	}
	return resultArray;
}
