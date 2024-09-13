const express = require("express");
const logger = require("./utils/log/logger");
// const requestLogger = require("./middlewares/loggerMiddleware");
const { connectToDatabase } = require("./lib/database/db");
const testRoute = require("./component/routes/testRoute");
const resourceRoutes = require("./component/routes/resource/resourceRoutes");
const ulbRoutes = require("./component/routes/ulb/ulbRoutes");
const schemeInfoRoutes = require("./component/routes/schemeInfo/schemeInfoRoutes");
const schemeInfoUpdateRoutes = require("./component/routes/schemeInfo/schemeInfoUpdateRoutes");
const financialSummaryRoute = require("./component/routes/financialSummaryReport/financialSummaryRoute");

const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// app.use(requestLogger);

app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello World !!! this is a finance project");
});

app.use(express.json());
app.use("/api/sudafc", testRoute);
app.use("/api/sudafc", resourceRoutes);
app.use("/api/sudafc", ulbRoutes);
app.use("/api/sudafc", schemeInfoRoutes);
app.use("/api/sudafc", schemeInfoUpdateRoutes);
app.use("/api/sudafc", financialSummaryRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
  logger.info(`Server started on port: http://localhost:${PORT}`);
});

// db connection
connectToDatabase();
