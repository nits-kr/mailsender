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
          count: { $sum: "$bulk_test" },
        },
      },
    ]);

    // Bar Chart Data: Group by Domain or Server
    const barData = await Log.aggregate([
      {
        $group: {
          _id: "$server",
          sent: { $sum: "$bulk_test" },
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

// @desc    Get recent logs (Table data)
// @route   GET /api/dashboard/logs
const getLogs = async (req, res) => {
  const { from, to } = req.query;
  let query = {};

  if (from && to) {
    query.sent_on = {
      $gte: new Date(from),
      $lte: new Date(to + "T23:59:59"),
    };
  }

  try {
    const logs = await Log.find(query).sort({ sent_on: -1 }).limit(1000);
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching logs", error: error.message });
  }
};

module.exports = { getStats, getLogs };
