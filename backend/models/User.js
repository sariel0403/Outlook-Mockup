const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  useremail: {
    type: String,
  },
  username: {
    type: String,
  },
  usertype: {
    type: String,
  },
  authProvider: {
    type: Object,
  },
  id: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

module.exports = User = mongoose.model("user", UserSchema);
