const Incomes = require("../model/incomes");
const jwt = require("jsonwebtoken");

const decoded = async req => {
  const {
    headers: { auth }
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

module.exports = {
  createIncome: async (req, res) => {
    const userDecoded = await decoded(req);
    req.body.userId = userDecoded._id;
    const incomes = await Incomes.create(req.body);
    return res
      .status(201)
      .send({ incomes, message: "Receita cadastrada com sucesso!" });
  },
  getIncomesByUser: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const incomes = await Incomes.find({ userId: userDecoded._id });
      return res.status(200).send(incomes);
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  }
};
