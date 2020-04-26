const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TagsSchema = new Schema({
  name: {
    type: String,
    required: true,
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

TagsSchema.pre("save", async function (next) {
  return next();
});

module.exports = mongoose.model("Tag", TagsSchema);
