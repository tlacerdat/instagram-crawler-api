const express = require("express");
const cors = require("cors");
const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

require("./src/routes/index")(app);

app.listen(port, () => console.log(`App listening on port ${port}!`));
