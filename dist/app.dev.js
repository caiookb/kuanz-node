"use strict";

var express = require("express");

var app = express();

var config = require("./src/config/config");

var mongoose = require("mongoose");

var bodyParser = require("body-parser");

var cors = require("cors");

var indexRoute = require("./src/routes/index");

var usersRoute = require("./src/routes/users");

var incomesRoute = require("./src/routes/incomes");

var spendingRoute = require("./src/routes/spending");

var goalsRoute = require("./src/routes/goals");

var url = config.bd_string;
var options = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  poolSize: 5,
  useNewUrlParser: true,
  useUnifiedTopology: true
};
mongoose.connect(url, options);
mongoose.set("useCreateIndex", true);
mongoose.connection.on("error", function (err) {
  console.log("Erro do banco: ", err);
});
mongoose.connection.on("connected", function (err) {
  console.log("Conectado ao banco de dados!");
});
mongoose.connection.on("disconnected", function () {
  console.log("Desconectado do banco!");
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use("/", indexRoute);
app.use("/users", usersRoute);
app.use("/incomes", incomesRoute);
app.use("/spending", spendingRoute);
app.use("/goals", goalsRoute);
app.listen(5000, function () {
  console.log("conectado");
});
module.exports = app;