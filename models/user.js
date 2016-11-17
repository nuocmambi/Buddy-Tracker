const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
let UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	phone: {
		type: String
	},
	name: {
		type: String
	},
	friends: {
		type: [String]
	}
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = (newUser, callback) => {
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.getUserByUsername = (username, callback) => {
	let query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = (id, callback) => {
	User.findById(id, callback);
}

module.exports.comparePassword = (candidatePassword, hash, callback) =>{
	bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
		if(err) throw err;
		callback(null, isMatch);
	});
}


module.exports.addFriend = (username, username2) => {
	let query = {username: username};

	User.findOne(query,  (err, user) => {
		if (err) throw err;
		console.log("hentes fra databasen: " + user.username);
		user.friends.push(username2);
		user.save( (err, updatedUser) => {
			if (err) throw err;
			console.log(user);
		})
	});
}
