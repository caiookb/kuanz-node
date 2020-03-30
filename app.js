const express = require("express");
const app = express();
const config = require("./src/config/config");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const indexRoute = require("./src/routes/index");
const usersRoute = require("./src/routes/users");
const incomesRoute = require("./src/routes/incomes");
const spendingRoute = require("./src/routes/spending");
const goalsRoute = require("./src/routes/goals");
const url = config.bd_string;

const options = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  poolSize: 5,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(url, options);
mongoose.set("useCreateIndex", true);

mongoose.connection.on("error", err => {
  console.log("Erro do banco: ", err);
});
mongoose.connection.on("connected", err => {
  console.log("Conectado ao banco de dados!");
});
mongoose.connection.on("disconnected", () => {
  console.log("Desconectado do banco!");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use("/", indexRoute);
app.use("/users", usersRoute);
app.use("/incomes", incomesRoute);
app.use("/spending", spendingRoute);
app.use("/goals", goalsRoute);
app.listen(5000, () => {
  console.log("conectado");
});

module.exports = app;
