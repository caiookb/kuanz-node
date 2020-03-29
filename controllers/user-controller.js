const Users = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const createUserToken = user => {
  return jwt.sign({ user }, config.jwt_secret, {
    expiresIn: config.jwt_expires_in
  });
};

module.exports = {
  authenticate: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send({ error: "Dados insuficientes!" });

    try {
      const user = await Users.findOne({ email }).select("+password");
      if (!user) return res.status(400).send({ error: "Usuário não existe!" });

      const passwordIsFine = await bcrypt.compare(password, user.password);

      if (!passwordIsFine)
        return res.status(401).send({ error: "Erro ao autenticar o usuário" });
      user.password = undefined;
      console.log("user no auth", user);
      return res.status(200).send({ token: createUserToken(user) });
    } catch (err) {
      return res.status(500).send({ error: "Erro ao buscar o usuário!" });
    }
  },

  getAll: async (req, res) => {
    console.log(res.locals.auth_data);
    try {
      const users = await Users.find({});
      return res.status(200).send(users);
    } catch (err) {
      return res.status(500).send({ error: "Erro na consulta de usuários!" });
    }
  },

  me: function(req, res, user) {
    console.log(user);
    return res.status(200).json(user);
  },

  createUser: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.send({ error: "Dados insuficientes" });

    try {
      if (await Users.findOne({ email }))
        return res.send({ error: "usuário já existe!" });

      const user = await Users.create(req.body);
      user.password = undefined;
      return res.status(201).send({ user, token: createUserToken(user) });
    } catch (err) {
      return res.status(500).send({ error: "Erro ao buscar user" });
    }
  }
};
