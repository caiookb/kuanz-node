const Spending = require("../model/spending");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const decoded = async (req) => {
  const {
    headers: { auth },
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

const getAllSpendingsAndSum = async (req) => {
  try {
    const { firstDate, lastDate } = req.query;
    const userDecoded = await decoded(req);
    const spendings = await Spending.find({ userId: userDecoded._id });
    const allSpendings = spendings.filter((spending) => {
      return (
        moment(spending.paidDate) > moment(firstDate) &&
        moment(spending.paidDate) < moment(lastDate)
      );
    });
    const totalValue =
      allSpendings.length > 0
        ? allSpendings
            .map((spending) => {
              return spending.value;
            })
            .reduce((acc, current) => parseFloat(acc) + parseFloat(current))
        : 0;
    return { totalValue, allSpendings };
  } catch (err) {
    return { totalValue: 0, allSpendings: [] };
  }
};

module.exports = {
  createSpending: async (req, res) => {
    try {
      const { period, repeat, paidDate } = req.body;
      const userDecoded = await decoded(req);
      req.body.userId = userDecoded._id;

      if (repeat >= 2) {
        for (let i = 0; i < repeat; i++) {
          const futureDate = moment(paidDate)
            .add(i, period)
            .format("YYYY-MM-DD");
          req.body.paidDate = futureDate;
          await Spending.create(req.body);
        }
      } else {
        await Spending.create(req.body);
      }

      const SpendingsAndSum = await getAllSpendingsAndSum(req);
      return res.status(201).send({
        ...SpendingsAndSum,
        message: "Despesa cadastrada com sucesso!",
      });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  getSpendingsByUser: async (req, res) => {
    try {
      const SpendingsAndSum = await getAllSpendingsAndSum(req);
      return res.status(200).send({ ...SpendingsAndSum });
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
      const SpendingsAndSum = await getAllSpendingsAndSum(req);
      res.status(200).send({
        remove,
        ...SpendingsAndSum,
        message: "Gasto deletado com sucesso!",
      });
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
      const SpendingsAndSum = await getAllSpendingsAndSum(req);
      res.status(200).send({
        update,
        ...SpendingsAndSum,
        message: "Gasto atualizada com sucesso!",
      });
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
