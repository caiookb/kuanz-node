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
    return { totalValue: parseFloat(totalValue).toFixed(2), allSpendings };
  } catch (err) {
    return { totalValue: 0, allSpendings: [] };
  }
};

const getAllSpendings = async (req) => {
  const userDecoded = await decoded(req);
  const spendings = await Spending.find({ userId: userDecoded._id });
  return spendings;
};

module.exports = {
  createSpending: async (req, res) => {
    try {
      const { period, repeat, paidDate } = req.body;
      const userDecoded = await decoded(req);
      req.body.userId = userDecoded._id;

      if (repeat >= 2) {
        let spendingFixedId = undefined;

        for (let i = 0; i < repeat; i++) {
          const futureDate = moment(paidDate)
            .add(i, period)
            .format("YYYY-MM-DD");
          req.body.paidDate = futureDate;
          req.body.repeated = true;

          if (i == 0) {
            await Spending.create(req.body).then((firstSpending) => {
              spendingFixedId = firstSpending._id;
            });
          } else {
            req.body.installmentId = spendingFixedId.toString();
            await Spending.create(req.body);
          }
        }
      } else {
        await Spending.create(req.body);
      }

      const SpendingsAndSum = await getAllSpendingsAndSum(req);
      return res.status(201).send({
        ...SpendingsAndSum,
        message: "Despesa cadastrada com sucesssssso!",
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
      const { spending_id, installmentType, installmentId } = req.body;
      const userDecoded = await decoded(req);
      const actualSpending = await Spending.findOne({
        _id: spending_id,
        userId: userDecoded._id,
      });
      const actualDate = moment(actualSpending.receiveDate);
      const allSpending = await getAllSpendings(req);
      const futureSpending = allSpending.filter(
        (Spending) => moment(Spending.receiveDate) > actualDate
      );
      if (installmentType === "ACTUAL") {
        await Spending.remove({
          _id: spending_id,
          userId: userDecoded._id,
        });
      } else if (installmentType === "ACTUAL_AND_NEXTS") {
        for (let i = 0; i < futureSpending.length; i++) {
          await Spending.remove({
            _id: futureSpending[i]._id,
            userId: userDecoded._id,
          });
        }
      } else if (installmentType === "EVERY") {
        const installmentSpending = allSpending.filter((Spending) => {
          return (
            Spending.id == installmentId ||
            Spending.installmentId == installmentId
          );
        });
        for (let i = 0; i < installmentSpending.length; i++) {
          await Spending.remove({
            _id: installmentSpending[i]._id,
            userId: userDecoded._id,
          });
        }
      }
      const SpendingAndSum = await getAllSpendingsAndSum(req);
      res.status(200).send({
        ...SpendingAndSum,
        message: "deletado com sucesso!",
      });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  updateSpendingById: async (req, res) => {
    try {
      const { spending_id, installmentType, installmentId } = req.body;
      const newValues = req.body;
      const userDecoded = await decoded(req);

      const actualSpending = await Spending.findOne({
        _id: spending_id,
        userId: userDecoded._id,
      });
      const actualDate = moment(actualSpending.paidDate);
      const allSpendings = await getAllSpendings(req);

      const filteredSpendings = allSpendings.filter((spendings) => {
        return (
          moment(spendings.paidDate) >= actualDate &&
          (spendings.id == installmentId ||
            spendings.installmentId == installmentId)
        );
      });

      filteredSpendings.map((mappedSpendings, i) => {
        mappedSpendings.name = newValues.name;
        mappedSpendings.value = newValues.value;
        mappedSpendings.installmentType = newValues.installmentType;
        // mappedSpendings.receiveDate = moment(newValues.receiveDate).add(
        //   i,
        //   period
        // );
      });

      if (installmentType === "ACTUAL") {
        await Spending.findOneAndUpdate(
          {
            _id: spending_id,
            userId: userDecoded._id,
          },
          { ...newValues },
          { useFindAndModify: true }
        );
      } else if (installmentType === "ACTUAL_AND_NEXTS") {
        console.log("Future Spending", filteredSpendings);

        for (let i = 0; i < filteredSpendings.length; i++) {
          await Spending.findOneAndUpdate(
            {
              _id: filteredSpendings[i]._id,
              userId: userDecoded._id,
            },
            { ...filteredSpendings[i]._doc },
            { useFindAndModify: true }
          );
        }
      } else if (installmentType === "EVERY") {
        const installmentSpendings = allSpendings.filter((spending) => {
          return (
            spending.id == installmentId ||
            spending.installmentId == installmentId
          );
        });

        installmentSpendings.map((mappedSpendings, i) => {
          mappedSpendings.name = newValues.name;
          mappedSpendings.value = newValues.value;
          mappedSpendings.installmentType = newValues.installmentType;
          // mappedSpendings.receiveDate = moment(newValues.receiveDate).add(
          //   i,
          //   period
          // );
        });

        for (let i = 0; i < installmentSpendings.length; i++) {
          await Spending.findByIdAndUpdate(
            {
              _id: installmentSpendings[i]._id,
              userId: userDecoded._id,
            },
            { ...installmentSpendings[i]._doc },
            { useFindAndModify: true }
          );
        }
      }

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
