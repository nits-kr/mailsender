const path = require("path");
const fs = require("fs");
const OfferSuppQueue = require("../models/OfferSuppQueue");
const OfferSuppMapping = require("../models/OfferSuppMapping");
const ComplainerSuppression = require("../models/ComplainerSuppression");
const Offer = require("../models/Offer");

// @desc    Upload suppression file
// @route   POST /api/suppression/upload
// @access  Private/Admin
const uploadSuppressionFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Upload OK",
    filename: req.file.filename,
    path: req.file.path,
  });
};

// @desc    Save/Update offer suppression mapping
// @route   POST /api/suppression/mapping
// @access  Private/Admin
const saveMapping = async (req, res) => {
  const { offer_id, filename } = req.body;
  try {
    const mapping = await OfferSuppMapping.findOneAndUpdate(
      { offer_id },
      { filename, upload_at: Date.now() },
      { upsert: true, new: true },
    );
    res.json(mapping);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving mapping", error: error.message });
  }
};

// @desc    Get all mappings
// @route   GET /api/suppression/mappings
// @access  Private
const getMappings = async (req, res) => {
  try {
    const mappings = await OfferSuppMapping.find({}).populate("offer_id");
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mappings" });
  }
};

// @desc    Delete a mapping
// @route   DELETE /api/suppression/mapping/:id
// @access  Private/Admin
const deleteMapping = async (req, res) => {
  try {
    await OfferSuppMapping.findByIdAndDelete(req.params.id);
    res.json({ message: "Mapping deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mapping" });
  }
};

// @desc    Queue suppression process
// @route   POST /api/suppression/queue
// @access  Private/Admin
const queueSuppression = async (req, res) => {
  const { offer_id, filename, new_filename } = req.body;

  try {
    const offer = await Offer.findById(offer_id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const mapping = await OfferSuppMapping.findOne({ offer_id });
    if (!mapping) {
      return res
        .status(400)
        .json({ message: "No suppression file mapped for this offer" });
    }

    const sourcePath = `/var/www/data/${filename}`;

    const queueItem = await OfferSuppQueue.create({
      offer_id,
      filename,
      new_filename,
      vendor_supp_filename: mapping.filename,
      status: 0, // Queued
      log: "Queued Successfully",
    });

    // Start processing in background (No await)
    const { processSuppression } = require("../workers/suppressionWorker");
    processSuppression(queueItem._id);

    res.status(201).json(queueItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error queueing suppression", error: error.message });
  }
};

// @desc    Get suppression queue
// @route   GET /api/suppression/queue
// @access  Private
const getSuppressionQueue = async (req, res) => {
  try {
    const queue = await OfferSuppQueue.find({})
      .populate("offer_id")
      .sort({ createdAt: -1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppression queue" });
  }
};

// @desc    Delete queue item
// @route   DELETE /api/suppression/queue/:id
// @access  Private/Admin
const deleteQueue = async (req, res) => {
  try {
    await OfferSuppQueue.findByIdAndDelete(req.params.id);
    res.json({ message: "Queue item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting queue item" });
  }
};

// @desc    Get log for a queue item
// @route   GET /api/suppression/log/:id
// @access  Private
const getLogs = async (req, res) => {
  try {
    const logPath = path.join(
      __dirname,
      "../../suppression/logs",
      `${req.params.id}.log`,
    );
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, "utf8");
      res.send(content);
    } else {
      res.status(404).send("Log file not found");
    }
  } catch (error) {
    res.status(500).send("Error reading log file");
  }
};

// @desc    Add complainers to suppression (batch)
// @route   POST /api/suppression/complainers
// @access  Private/Admin
const addComplainers = async (req, res) => {
  const { offer_id, emails } = req.body;

  if (!offer_id || !emails) {
    return res
      .status(400)
      .json({ message: "Offer ID and emails are required" });
  }

  const emailList = emails
    .split(/[\r\n,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  if (emailList.length === 0) {
    return res
      .status(400)
      .json({ message: "No valid email addresses provided" });
  }

  try {
    const results = [];
    for (const email_id of emailList) {
      try {
        await ComplainerSuppression.findOneAndUpdate(
          { offer_id, email_id },
          { date_inserted: Date.now() },
          { upsert: true, new: true },
        );
        results.push({ email_id, status: "success" });
      } catch (err) {
        results.push({ email_id, status: "error", message: err.message });
      }
    }
    res.json({ message: "Processing complete", results });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding complainers", error: error.message });
  }
};

// @desc    Get counts grouped by offer
// @route   GET /api/suppression/complainers/grouped
// @access  Private
const getComplainersGrouped = async (req, res) => {
  try {
    const groupedData = await ComplainerSuppression.aggregate([
      {
        $group: {
          _id: "$offer_id",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "_id",
          foreignField: "_id",
          as: "offer_details",
        },
      },
      {
        $unwind: "$offer_details",
      },
      {
        $project: {
          offer_id: "$_id",
          count: 1,
          offer_name: "$offer_details.offer_name",
          affiliate: "$offer_details.affiliate",
          offer_id_label: "$offer_details.offer_id",
        },
      },
      { $sort: { offer_name: 1 } },
    ]);
    res.json(groupedData);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching grouped complainers",
      error: error.message,
    });
  }
};

// @desc    Get emails for a specific offer
// @route   GET /api/suppression/complainers/offer/:offer_id
// @access  Private
const getComplainersByOffer = async (req, res) => {
  try {
    const emails = await ComplainerSuppression.find({
      offer_id: req.params.offer_id,
    }).sort({ email_id: 1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching emails for offer" });
  }
};

// @desc    Delete a complainer email
// @route   DELETE /api/suppression/complainers/:id
// @access  Private/Admin
const deleteComplainer = async (req, res) => {
  try {
    await ComplainerSuppression.findByIdAndDelete(req.params.id);
    res.json({ message: "Complainer email removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing email" });
  }
};

module.exports = {
  uploadSuppressionFile,
  saveMapping,
  getMappings,
  deleteMapping,
  queueSuppression,
  getSuppressionQueue,
  deleteQueue,
  getLogs,
  addComplainers,
  getComplainersGrouped,
  getComplainersByOffer,
  deleteComplainer,
};
