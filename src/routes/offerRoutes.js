const express = require("express");
const {
  addOffer,
  getOffers,
  updateOffer,
} = require("../controllers/offerController");

const router = express.Router();

router.post("/", addOffer);
router.get("/", getOffers);
router.put("/:id", updateOffer);

module.exports = router;
