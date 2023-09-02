require("dotenv").config();

const express = require("express");
const cors = require("cors");
const asertoRbac = require("./aserto-rbac.js");

const PORT = 3001;
const rbac = asertoRbac();
const app = express();

app.use(express.json());
app.use(cors());
app.use(rbac.checkJwt);
app.use(rbac.checkIsInGroup);

app.all("/is_in_group", async (req, res) => {
  res.send("Hello from /is_in_group");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
