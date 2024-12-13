import { Sequelize, DataTypes } from "sequelize";
import logger from "./logger";

export const sequelize = new Sequelize(
  "postgres://TIE:TIE-International@localhost:5555/tie-DB"
);

sequelize
  .authenticate()
  .then(() => {
    logger.info("Succesfull DB connection");
  })
  .catch((err) => {
    logger.error(err);
  });

const Users = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    salt: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    postcode: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    registration_time: {
      type: DataTypes.DATE,
    },
    email_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    identity_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

const Files = sequelize.define("files", {
  filename: {
    type: DataTypes.STRING,
  },
});

Users.hasMany(Files, {
  foreignKey: {
    name: "userId",
  },
});
Files.belongsTo(Users);

Users.sync({ force: true }).then(() => Files.sync({ force: true }));

export { Users, Files };
