const Incomes = require("../model/incomes");
const jwt = require("jsonwebtoken");
const moment = require("moment");

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
      const { period, repeat, receiveDate } = req.body;
      const userDecoded = await decoded(req);
      req.body.userId = userDecoded._id;

      if (repeat >= 2) {
        for (let i = 0; i < repeat; i++) {
          const futureDate = moment(receiveDate)
            .add(i, period)
            .format("YYYY-MM-DD");
          req.body.receiveDate = futureDate;
          await Incomes.create(req.body);
        }
      } else {
        await Incomes.create(req.body);
      }

      const allIncomes = await Incomes.find({ userId: userDecoded._id });
      const totalSum = allIncomes
        .map((income) => {
          return income.value;
        })
        .reduce((acc, current) => parseFloat(acc) + parseFloat(current));
      return res.status(201).send({
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
      const { firstDate, lastDate } = req.query;
      const userDecoded = await decoded(req);
      const incomes = await Incomes.find({ userId: userDecoded._id }).filter(
        (income) => {
          return (
            moment(income.receiveDate) < moment(lastDate) &&
            moment(income.receiveDate) > moment(firstDate)
          );
        }
      );
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
      const allIncomes = await Incomes.find({ userId: userDecoded._id });
      const totalSum = allIncomes
        .map((income) => {
          return income.value;
        })
        .reduce((acc, current) => parseFloat(acc) + parseFloat(current));
      res.status(200).send({
        remove,
        allIncomes,
        totalValue: totalSum,
        message: "deletado com sucesso!",
      });
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

      const allIncomes = await Incomes.find({ userId: userDecoded._id });
      const totalSum = allIncomes
        .map((income) => {
          return income.value;
        })
        .reduce((acc, current) => parseFloat(acc) + parseFloat(current));

      res.status(200).send({
        update,
        allIncomes,
        totalValue: totalSum,
        message: "Receita atualizada com sucesso!",
      });
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
