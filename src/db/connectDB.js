const mongoose = require("mongoose");
require('dotenv').config()

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL)
  .then((db) => console.log("DB is connected"))
  .catch((err) => console.log(err));