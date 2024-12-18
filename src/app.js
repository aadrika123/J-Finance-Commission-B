const express = require("express");
const logger = require("./utils/log/logger");
const requestLogger = require("./middlewares/auditLogMiddleware");
const { connectToDatabase } = require("./lib/database/db");
const testRoute = require("./component/routes/testRoute");
const ulbRoutes = require("./component/routes/ulb/ulbRoutes");
const schemeInfoRoutes = require("./component/routes/schemeInfo/schemeInfoRoutes");
const schemeInfoUpdateRoutes = require("./component/routes/schemeInfo/schemeInfoUpdateRoutes");
const financialSummaryRoute = require("./component/routes/financialSummaryReport/financialSummaryRoute");
const financialRoutes = require("./component/routes/financialSummaryReport/financialDashboardRoute");
const fileUpload = require("./component/routes/letterUpload/letterUploadRoute");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());

app.use(requestLogger);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "middlewares/utils/fileUpload/uploads"))
);

app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello World !!! this is a finance project");
});

app.use(express.json());
app.use("/api/sudafc", testRoute);
app.use("/api/sudafc", ulbRoutes);
app.use("/api/sudafc", schemeInfoRoutes);
app.use("/api/sudafc", schemeInfoUpdateRoutes);
app.use("/api/sudafc", financialSummaryRoute);
app.use("/api/sudafc", financialRoutes);
app.use("/api/sudafc", fileUpload);

app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
  logger.info(`Server started on port: http://localhost:${PORT}`);
});

// db connection
connectToDatabase();
