const express = require("express");
const logger = require("./utils/logger");
const requestLogger = require("./middlewares/loggerMiddleware");
const { connectToDatabase } = require("./lib/database/db");
const testRoute = require("./routes/testRoute");
const resourceRoutes = require("./routes/resourceRoutes");
const ulbRoutes = require("./routes/ulbRoutes");
const schemeInfoRoutes = require("./routes/schemeInfoRoutes");
const schemeInfoUpdateRoutes = require("./routes/schemeInfoUpdateRoutes");
const financialSummaryRoute = require("./routes/financialSummaryRoute");

const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(requestLogger);

app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello World !!! this is a finance project");
});

app.use(express.json());
app.use("/api", testRoute);
app.use("/api", resourceRoutes);
app.use("/api", ulbRoutes);
app.use("/api", schemeInfoRoutes);
app.use("/api", schemeInfoUpdateRoutes);
app.use("/api", financialSummaryRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
  logger.info(`Server started on port: http://localhost:${PORT}`);
});

// db connection
connectToDatabase();
