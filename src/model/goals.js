const mongoose = require("mongoose");
const Schema = mongoose.Schema;
console.log("salva porraaaaaaaaaaaaa");

const GoalSchema = new Schema({
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

GoalSchema.pre("save", async function(next) {
  return next();
});

module.exports = mongoose.model("Goal", GoalSchema);
