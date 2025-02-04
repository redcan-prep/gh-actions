const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.get("/sum", (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    return res.status(400).json({ error: "Missing query parameters" });
  }
  res.json({ result: Number(a) + Number(b) });
});

app.get("/bye", (req, res) => {
  res.json({ message: "OKAY, BYE NOW!!" });
});

module.exports = app;
