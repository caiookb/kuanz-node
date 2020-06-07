const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Spending = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: "spending",
  },
  paid: {
    type: Boolean,
    require: true,
  },
  paidDate: {
    type: Date,
    required: true,
  },
  repeat: {
    type: Number,
    required: false,
    default: 0,
  },
  installmentId: {
    type: String,
    required: false,
  },
  period: {
    type: String,
    required: false,
    default: 0,
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

Spending.pre("save", async function (next) {
  return next();
});

module.exports = mongoose.model("Spending", Spending);
