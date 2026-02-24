const express = require("express");
const {
  getTestIds,
  addTestId,
  updateTestId,
  deleteTestId,
} = require("../controllers/testIdsController");

const router = express.Router();

router.get("/", getTestIds);
router.post("/", addTestId);
router.put("/:id", updateTestId);
router.delete("/:id", deleteTestId);

module.exports = router;
