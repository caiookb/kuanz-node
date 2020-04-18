const Spending = require("../model/spending");
const jwt = require("jsonwebtoken");

const decoded = async (req) => {
  const {
    headers: { auth },
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

module.exports = {
  createSpending: async (req, res) => {
    const userDecoded = await decoded(req);
    req.body.userId = userDecoded._id;
    const spendings = await Spending.create(req.body);
    const allSpendings = await Spending.find({ userId: userDecoded._id });
    return res.status(201).send({
      spendings,
      allSpendings,
      message: "Despesa cadastrada com sucesso!",
    });
  },
  getSpendingsByUser: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const spendings = await Spending.find({ userId: userDecoded._id });
      const totalSum = spendings
        .map((spending) => {
          return spending.value;
        })
        .reduce((acc, current) => parseFloat(acc) + parseFloat(current));
      return res.status(200).send({ totalValue: totalSum, spendings });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  deleteSpendingById: async (req, res) => {
    try {
      const { spending_id } = req.body;
      const userDecoded = await decoded(req);
      const spendingToDelete = await Spending.findOne({
        _id: spending_id,
        userId: userDecoded._id,
      });
      const remove = await Spending.remove({
        _id: spendingToDelete._id,
        userId: spendingToDelete.userId,
      });
      res.status(200).send({ remove, message: "Gasto deletado com sucesso!" });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  updateSpendingById: async (req, res) => {
    try {
      const { _id } = req.body;
      const newValues = req.body;
      const userDecoded = await decoded(req);
      const update = await Spending.findByIdAndUpdate(
        {
          userId: userDecoded._id,
          _id: _id,
        },
        { ...newValues },
        { useFindAndModify: true }
      );

      res
        .status(200)
        .send({ update, message: "Gasto atualizada com sucesso!" });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  getSpendingById: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const { _id } = req.params;

      const spending = await Spending.findOne({
        userId: userDecoded._id,
        _id: _id,
      });
      return res.status(200).send(spending);
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
};
