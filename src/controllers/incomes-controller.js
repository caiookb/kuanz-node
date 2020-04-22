const Incomes = require("../model/incomes");
const jwt = require("jsonwebtoken");

const decoded = async (req) => {
  const {
    headers: { auth },
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

module.exports = {
  createIncome: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      req.body.userId = userDecoded._id;
      const incomes = await Incomes.create(req.body);
      const allIncomes = await Incomes.find({ userId: userDecoded._id });
      const totalSum = allIncomes
        .map((income) => {
          return income.value;
        })
        .reduce((acc, current) => parseFloat(acc) + parseFloat(current));
      return res.status(201).send({
        incomes,
        allIncomes,
        totalValue: totalSum,
        message: "Receita cadastrada com sucesso!",
      });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  getIncomesByUser: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const incomes = await Incomes.find({ userId: userDecoded._id });
      const totalSum = incomes
        .map((income) => {
          return income.value;
        })
        .reduce((acc, current) => parseFloat(acc) + parseFloat(current));
      return res.status(200).send({ totalValue: totalSum, incomes });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  deleteIncomeById: async (req, res) => {
    try {
      const { income_id } = req.body;
      const userDecoded = await decoded(req);
      const incomeToDelete = await Incomes.findOne({
        _id: income_id,
        userId: userDecoded._id,
      });
      const remove = await Incomes.remove({
        _id: incomeToDelete._id,
        userId: incomeToDelete.userId,
      });
      res.status(200).send({ remove, message: "deletado com sucesso!" });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  updateIncomeById: async (req, res) => {
    try {
      const { _id } = req.body;
      const newValues = req.body;
      const userDecoded = await decoded(req);
      const update = await Incomes.findByIdAndUpdate(
        {
          userId: userDecoded._id,
          _id: _id,
        },
        { ...newValues },
        { useFindAndModify: true }
      );

      res
        .status(200)
        .send({ update, message: "Receita atualizada com sucesso!" });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  getIncomesById: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const { _id } = req.params;

      const income = await Incomes.findOne({
        userId: userDecoded._id,
        _id: _id,
      });
      return res.status(200).send(income);
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
};
