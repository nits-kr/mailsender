const {
  setupServer,
  getSqlFiles,
} = require("../controllers/serverSetupController");

const router = express.Router();

router.post("/setup", setupServer);
router.get("/sql-files", getSqlFiles);

module.exports = router;
