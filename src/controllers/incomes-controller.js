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

const getAllIncomesAndSum = async (req) => {
  try {
    const { firstDate, lastDate } = req.query;
    const userDecoded = await decoded(req);
    const incomes = await Incomes.find({ userId: userDecoded._id });
    const allIncomes = incomes.filter((income) => {
      return (
        moment(income.receiveDate) > moment(firstDate) &&
        moment(income.receiveDate) < moment(lastDate)
      );
    });
    const totalValue =
      allIncomes.length > 0
        ? allIncomes
            .map((income) => {
              return income.value;
            })
            .reduce((acc, current) => parseFloat(acc) + parseFloat(current))
        : 0;
    return { totalValue: parseFloat(totalValue).toFixed(2), allIncomes };
  } catch (err) {
    return { totalValue: 0, allIncomes: [] };
  }
};

const getAllIncomes = async (req) => {
  const userDecoded = await decoded(req);
  const incomes = await Incomes.find({ userId: userDecoded._id });
  return incomes;
};

module.exports = {
  createIncome: async (req, res) => {
    try {
      const { period, repeat, receiveDate } = req.body;
      const userDecoded = await decoded(req);

      req.body.userId = userDecoded._id;

      if (repeat >= 2) {
        let incomeFixedId = undefined;

        for (let i = 0; i < repeat; i++) {
          const futureDate = moment(receiveDate)
            .add(i, period)
            .format("YYYY-MM-DD");
          req.body.receiveDate = futureDate;
          req.body.repeated = true;

          if (i == 0) {
            await Incomes.create(req.body).then((firstIncome) => {
              incomeFixedId = firstIncome._id;
            });
          } else {
            req.body.installmentId = incomeFixedId.toString();
            await Incomes.create(req.body);
          }
        }
      } else {
        await Incomes.create(req.body);
      }
      const IncomesAndSum = await getAllIncomesAndSum(req);
      return res.status(201).send({
        ...IncomesAndSum,
        message: "Receita cadastrada com sucesso!",
      });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  getIncomesByUser: async (req, res) => {
    try {
      const IncomesAndSum = await getAllIncomesAndSum(req);
      return res.status(200).send({ ...IncomesAndSum });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  deleteIncomeById: async (req, res) => {
    try {
      const { income_id, installmentType, installmentId } = req.body;
      const userDecoded = await decoded(req);
      const actualIncome = await Incomes.findOne({
        _id: income_id,
        userId: userDecoded._id,
      });
      const actualDate = moment(actualIncome.receiveDate);
      const allIncomes = await getAllIncomes(req);
      const futureIncomes = allIncomes.filter(
        (incomes) => moment(incomes.receiveDate) >= actualDate
      );
      if (installmentType === "ACTUAL") {
        await Incomes.remove({
          _id: income_id,
          userId: userDecoded._id,
        });
      } else if (installmentType === "ACTUAL_AND_NEXTS") {
        for (let i = 0; i < futureIncomes.length; i++) {
          await Incomes.remove({
            _id: futureIncomes[i]._id,
            userId: userDecoded._id,
          });
        }
      } else if (installmentType === "EVERY") {
        const installmentIncomes = allIncomes.filter((incomes) => {
          return (
            incomes.id == installmentId ||
            incomes.installmentId == installmentId
          );
        });
        for (let i = 0; i < installmentIncomes.length; i++) {
          await Incomes.remove({
            _id: installmentIncomes[i]._id,
            userId: userDecoded._id,
          });
        }
      }

      const IncomesAndSum = await getAllIncomesAndSum(req);
      res.status(200).send({
        ...IncomesAndSum,
        message: "deletado com sucesso!",
      });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  updateIncomeById: async (req, res) => {
    try {
      const { income_id, installmentType, installmentId } = req.body;
      const newValues = req.body;
      const userDecoded = await decoded(req);
      const actualIncome = await Incomes.findOne({
        _id: income_id,
        userId: userDecoded._id,
      });
      const actualDate = moment(actualIncome.receiveDate);
      const allIncomes = await getAllIncomes(req);

      const filteredIncomes = allIncomes.filter((incomes) => {
        return (
          moment(incomes.receiveDate) >= actualDate &&
          (incomes.id == installmentId ||
            incomes.installmentId == installmentId)
        );
      });

      filteredIncomes.map((mappedIncomes, i) => {
        mappedIncomes.name = newValues.name;
        mappedIncomes.value = newValues.value;
        mappedIncomes.installmentType = newValues.installmentType;
        // mappedIncomes.receiveDate = moment(newValues.receiveDate).add(
        //   i,
        //   period
        // );
      });

      if (installmentType === "ACTUAL") {
        await Incomes.findOneAndUpdate(
          {
            _id: income_id,
            userId: userDecoded._id,
          },
          { ...newValues },
          { useFindAndModify: true }
        );
      } else if (installmentType === "ACTUAL_AND_NEXTS") {
        console.log("Future incomes", filteredIncomes);

        for (let i = 0; i < filteredIncomes.length; i++) {
          await Incomes.findOneAndUpdate(
            {
              _id: filteredIncomes[i]._id,
              userId: userDecoded._id,
            },
            { ...filteredIncomes[i]._doc },
            { useFindAndModify: true }
          );
        }
      } else if (installmentType === "EVERY") {
        const installmentIncomes = allIncomes.filter((incomes) => {
          return (
            incomes.id == installmentId ||
            incomes.installmentId == installmentId
          );
        });

        installmentIncomes.map((mappedIncomes, i) => {
          mappedIncomes.name = newValues.name;
          mappedIncomes.value = newValues.value;
          mappedIncomes.installmentType = newValues.installmentType;
          // mappedIncomes.receiveDate = moment(newValues.receiveDate).add(
          //   i,
          //   period
          // );
        });

        for (let i = 0; i < installmentIncomes.length; i++) {
          await Incomes.findByIdAndUpdate(
            {
              _id: installmentIncomes[i]._id,
              userId: userDecoded._id,
            },
            { ...installmentIncomes[i]._doc },
            { useFindAndModify: true }
          );
        }
      }

      const IncomesAndSum = await getAllIncomesAndSum(req);

      res.status(200).send({
        ...IncomesAndSum,
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
