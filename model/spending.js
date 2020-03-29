const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IncomeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: "spending"
  },
  received: {
    type: Boolean,
    require: true
  },
  receiveDate: {
    type: Date,
    required: true
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

IncomeSchema.pre("save", async function(next) {
  return next();
});

module.exports = mongoose.model("Income", IncomeSchema);
