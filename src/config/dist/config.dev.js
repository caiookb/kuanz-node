"use strict";

var env = process.env.NODE_ENV || "dev";

var config = function config() {
  switch (env) {
    case "dev":
      return {
        bd_string: "mongodb+srv://cmAdmin:hmuewvjQuLGu0wV4@kuanz-db-cd0qm.gcp.mongodb.net/test?retryWrites=true&w=majority",
        jwt_secret: "matoras600kuanz",
        jwt_expires_in: "7d",
        jwtSession: {
          session: false
        }
      };

    case "hml":
      return {
        bd_string: ""
      };

    case "prod":
      return {};
  }
};

console.log("Iniciando a API em ambiente ".concat(env.toUpperCase()));
module.exports = config();