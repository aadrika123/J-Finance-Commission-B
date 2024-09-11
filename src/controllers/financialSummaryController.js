const {
  fetchFinancialSummaryReport,
} = require("../dao/financialSummaryReport/financialSummaryDao");

const getFinancialSummaryReport = async (req, res) => {
  try {
    // Extract filter parameters from the request query
    const { city_type, grant_type, sector, financial_year } = req.query;

    // Pass the filter parameters to the DAO function
    const report = await fetchFinancialSummaryReport(
      city_type,
      grant_type,
      sector,
      financial_year
    );

    // Convert BigInt to string in the result
    const result = report.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "bigint" ? value.toString() : value,
        ])
      );
    });

    res.status(200).json({
      status: true,
      message: "Financial summary report fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching financial summary report:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch financial summary report",
      error: error.message,
    });
  }
};

module.exports = {
  getFinancialSummaryReport,
};
