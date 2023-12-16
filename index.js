require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./router/index.js");
const connectDb = require("./utils/db.js");
const colors = require("colors");
const bodyParser = require("body-parser");
// const path = require("path");

const app = express();

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Increase the payload size limit (for example, to 50MB)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("auth server is working");
});

connectDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`server is running at port: ${process.env.PORT}`.bgGreen);
  });
});
