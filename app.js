const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

const PORT = process.env.PORT || 11500;

app.get("/", (req, res) => {
  res.send("Text Analysis API");
});

app.use(bodyParser.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log("Text Analysis API started on port: " + PORT);
});
