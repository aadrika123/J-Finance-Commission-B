const express = require("express");
const logger = require("./utils/log/logger");
const requestLogger = require("./middlewares/loggerMiddleware");
const { connectToDatabase } = require("./lib/database/db");
const testRoute = require("./component/routes/testRoute");
const resourceRoutes = require("./component/routes/resourceRoutes");
const ulbRoutes = require("./component/routes/ulbRoutes");
const schemeInfoRoutes = require("./component/routes/schemeInfoRoutes");
const schemeInfoUpdateRoutes = require("./component/routes/schemeInfoUpdateRoutes");
const financialSummaryRoute = require("./component/routes/financialSummaryRoute");

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
