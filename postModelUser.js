// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String,
// });

// const postModel = mongoose.model("coins", userSchema);

// module.exports = postModel;


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
});

const postModelUser = mongoose.model("User", userSchema);
module.exports = postModelUser;