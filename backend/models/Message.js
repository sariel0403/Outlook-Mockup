const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  id: {
    type: String,
  },
});

module.exports = Message = mongoose.model("message", MessageSchema);
