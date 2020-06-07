const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IncomeSchema = new Schema({
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
    default: "income",
  },
  received: {
    type: Boolean,
    require: true,
  },
  receiveDate: {
    type: Date,
    required: true,
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
  installmentId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

IncomeSchema.pre("save", async function (next) {
  return next();
});

module.exports = mongoose.model("Income", IncomeSchema);
