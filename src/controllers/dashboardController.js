const Log = require("../models/Log");

// @desc    Get dashboard stats (Chart data)
// @route   GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    // Pie Chart Data: Group by Server/SMTP
    const pieData = await Log.aggregate([
      {
        $group: {
          _id: "$server",
          count: { $sum: { $add: ["$bulk_test", "$test_sent"] } },
        },
      },
    ]);

    // Bar Chart Data: Group by Domain or Server
    const barData = await Log.aggregate([
      {
        $group: {
          _id: "$server",
          sent: { $sum: { $add: ["$bulk_test", "$test_sent"] } },
        },
      },
    ]);

    res.json({ pieData, barData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

const getLogs = async (req, res) => {
  const { from, to, page = 1, limit = 10, search = "" } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const pageSize = parseInt(limit);

  let query = {};

  if (from && to) {
    query.sent_on = {
      $gte: new Date(from),
      $lte: new Date(to + "T23:59:59"),
    };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { mailer: searchRegex },
      { template_id: searchRegex },
      { interface: searchRegex },
      { server: searchRegex },
      { offer_id: searchRegex },
      { domain: searchRegex },
      { from: searchRegex },
    ];
  }

  try {
    const totalLogs = await Log.countDocuments(query);
    const logs = await Log.find(query)
      .sort({ sent_on: -1 })
      .skip(skip)
      .limit(pageSize);

    // Calculate totals for the entire filtered set (not just the current page)
    const totalsResult = await Log.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          test_sent: { $sum: "$test_sent" },
          bulk_test_sent: { $sum: "$bulk_test_sent" },
          bulk_test: { $sum: "$bulk_test" },
          error: { $sum: "$error" },
        },
      },
    ]);

    const totals =
      totalsResult.length > 0
        ? totalsResult[0]
        : {
            test_sent: 0,
            bulk_test_sent: 0,
            bulk_test: 0,
            error: 0,
          };

    res.json({
      data: logs,
      total: totalLogs,
      totalPages: Math.ceil(totalLogs / pageSize),
      currentPage: parseInt(page),
      totals,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching logs", error: error.message });
  }
};

module.exports = { getStats, getLogs };
