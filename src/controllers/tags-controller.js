const Tags = require("../model/tags");
const jwt = require("jsonwebtoken");

const defaultTags = [
  "Alimentação",
  "Lazer",
  "Conta de casa",
  "Cartão",
  "Roupas",
  "Transporte",
  "Presente",
];

const decoded = async (req) => {
  const {
    headers: { auth },
  } = req;
  const userDecoded = await jwt.decode(auth);
  return userDecoded.user;
};

const getAllTags = async (req) => {
  try {
    const userDecoded = await decoded(req);
    const tags = await Tags.find({ userId: userDecoded._id });
    const mappedTags = tags.map((tag) => tag.name);
    return mappedTags;
  } catch (err) {
    return defaultTags;
  }
};

const CheckRepeatedTag = async (obj) => {
  const { req, name } = obj;
  const allTags = await getAllTags(req);
  if (allTags.includes(name)) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  createDefaultTags: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      defaultTags.map(async (tag) => {
        const objAndReq = { name: tag, userId: userDecoded._id, req };
        const isValid = await CheckRepeatedTag(objAndReq);
        if (isValid) {
          const objToSave = { name: tag, userId: userDecoded._id };
          await Tags.create(objToSave);
        }
      });
      const allTags = await getAllTags(req);
      return res.status(201).send(allTags);
    } catch (err) {
      return { error: "Erro ao criar as tags" };
    }
  },
  createTag: async (req, res) => {
    try {
      const userDecoded = await decoded(req);
      req.body.userId = userDecoded._id;

      const objAndReq = { name: req.body.name, userId: userDecoded._id, req };
      const isValid = await CheckRepeatedTag(objAndReq);

      if (isValid) {
        await Tags.create(req.body);
        const allTags = await getAllTags(req);
        return res.status(201).send(allTags);
      } else {
        return res.status(400).send({ error: "Tag já existe!" });
      }
    } catch (err) {
      res.status(500).send({ error: "Erro ao criar a tag" });
    }
  },
  getTag: async (req, res) => {
    try {
      const tags = await getAllTags(req);
      return res.status(200).send(tags);
    } catch (err) {
      res.status(500).send({ error: "Erro ao retronar as tags" });
    }
  },
  deleteTag: async (req, res) => {
    try {
      const { name } = req.body;
      const userDecoded = await decoded(req);

      const tagToDelete = await Tags.findOne({
        userId: userDecoded._id,
        name: name,
      });

      await Tags.remove({
        _id: tagToDelete._id,
        userId: tagToDelete.userId,
      });

      const allTags = await getAllTags(req);
      res.status(200).send({
        allTags,
        message: "deletado com sucesso!",
      });
    } catch (err) {
      res.status(500).send({ error: "Tag não existente" });
    }
  },
};
