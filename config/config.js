const env = process.env.NODE_ENV || "dev";

const config = () => {
  switch (env) {
    case "dev":
      return {
        bd_string: "mongodb://localhost/node_rest_api",
        jwt_secret: "matoras600kuanz",
        jwt_expires_in: "7d",
        jwtSession: { session: false }
      };

    case "hml":
      return {
        bd_string: ""
      };

    case "prod":
      return {};
  }
};

console.log(`Iniciando a API em ambiente ${env.toUpperCase()}`);

module.exports = config();
