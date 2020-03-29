const Spending = require("../model/spending");
const jwt = require("jsonwebtoken");

const decoded = async req => {
  const {
    headers: { auth }
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

module.exports = {
  createSpending: async (req, res) => {
    const userDecoded = await decoded(req);
    req.body.userId = userDecoded._id;
    const spendings = await Spending.create(req.body);
    return res
      .status(201)
      .send({ spendings, message: "Despesa cadastrada com sucesso!" });
  },
  getSpendingsByUser: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const spendings = await Spending.find({ userId: userDecoded._id });
      return res.status(200).send(spendings);
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  }
};
