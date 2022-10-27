const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RuleSchema = new Schema({
  filter: {
    type: String,
  },
  folder: {
    type: String,
  },
});

module.exports = Rule = mongoose.model("rule", RuleSchema);
