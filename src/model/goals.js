const mongoose = require("mongoose");
const Schema = mongoose.Schema;
console.log("salva pzorraaaaaaaaaaaaa");

const GoalSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  estimated_date: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "IN_PROGRESS",
  },
  description: {
    type: String,
    required: false,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

GoalSchema.pre("save", async function (next) {
  return next();
});

module.exports = mongoose.model("Goal", GoalSchema);
