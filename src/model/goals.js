const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GoalsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  estimated_date: {
    type: Date,
    required: true
  },
  done: {
    type: Boolean,
    required: true,
    default: false
  },
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

GoalsSchema.pre("save", async function(next) {
  return next();
});

module.exports = mongoose.model("Goals", GoalsSchema);
