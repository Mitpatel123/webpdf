const express = require("express");
const port = 12345;
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
mongoose.connect("mongodb+srv://mit:7NPfHJsHK3Z7o8WI@mit.fsaq7gz.mongodb.net/ILOVEPDF", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((res) => {
  console.log("mongoose connected");
}).catch((error) => {
  console.log("mongoose connection error:", error);
});
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const alluserrouting = require("./src/routing/user");


alluserrouting(app);
const allPDFrouting = require ("./src/routing/pdf");
allPDFrouting(app);
app.listen(port, () => {
  console.info('Server live on port', port);
}); 
















