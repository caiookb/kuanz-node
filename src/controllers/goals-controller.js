const Goals = require("../model/goals");
const jwt = require("jsonwebtoken");

const decoded = async req => {
  const {
    headers: { auth }
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

module.exports = {
  createGoal: async (req, res) => {
    try {
      const { name, estimated_date } = req.body;
      if (!name || !estimated_date)
        return res.status(400).send({ error: "Dados insuficientes!" });

      const userDecoded = await decoded(req);
      req.body.userId = await userDecoded._id;
      const goals = await Goals.create(req.body);
      console.log("GOALS", goals);
      return res.status(201).send({ success: true, goals });
    } catch (err) {
      return res
        .status(500)
        .send({ error: "Ocorreu algum erro na requisssição" });
    }
  },
  getGoalsByUser: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const goals = await Goals.find({ userId: userDecoded._id });
      return res.status(200).send(goals);
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  deleteGoalsById: async (req, res) => {
    try {
      const { goal_id } = req.body;
      const userDecoded = await decoded(req);
      const goalToDelete = await Goals.findOne({
        _id: goal_id,
        userId: userDecoded._id
      });
      const remove = await Incomes.remove({
        _id: goalToDelete._id,
        userId: goalToDelete.userId
      });
      res.status(200).send({ remove, message: "Meta apagada com sucesso!" });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  updateGoalById: async (req, res) => {
    try {
      const { _id } = req.body;
      const newValues = req.body;
      const userDecoded = await decoded(req);
      const update = await Goals.findByIdAndUpdate(
        {
          userId: userDecoded._id,
          _id: _id
        },
        { ...newValues },
        { useFindAndModify: true }
      );
      res.status(200).send({ update, message: "Meta atualizada com sucesso!" });
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  },
  getGoalById: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      const { _id } = req.params;

      const goal = await Goals.findOne({
        userId: userDecoded._id,
        _id: _id
      });
      return res.status(200).send(goal);
    } catch (err) {
      res.status(500).send({ error: "Ocorreu algum erro na requisição" });
    }
  }
};
