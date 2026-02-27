const { addOfferSchema } = require("../utils/validators");
const Offer = require("../models/Offer");

// @desc    Add new offer
// @route   POST /api/offers
// @access  Private/Admin
const addOffer = async (req, res) => {
  try {
    addOfferSchema.parse(req.body);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: error.errors });
  }
  const {
    affiliate,
    offer_name,
    offer_id,
    payout,
    sub_url,
    unsub_url,
    open_url,
    opt_out_url,
    sensitive,
    from_name,
    subject,
    restrictions,
  } = req.body;

  try {
    const offer = await Offer.create({
      affiliate,
      offer_name,
      offer_id,
      payout,
      sub_url,
      unsub_url,
      open_url,
      opt_out_url,
      sensitive,
      from_name,
      subject,
      restrictions,
    });

    if (offer) {
      res.status(201).json(offer);
    } else {
      res.status(400).json({ message: "Invalid offer data" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding offer", error: error.message });
  }
};

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({}).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offers" });
  }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = async (req, res) => {
  const {
    affiliate,
    offer_name,
    offer_id,
    payout,
    sub_url,
    unsub_url,
    open_url,
    opt_out_url,
    sensitive,
    from_name,
    subject,
    restrictions,
  } = req.body;

  try {
    const offer = await Offer.findById(req.params.id);

    if (offer) {
      offer.affiliate = affiliate || offer.affiliate;
      offer.offer_name = offer_name || offer.offer_name;
      offer.offer_id = offer_id || offer.offer_id;
      offer.payout = payout || offer.payout;
      offer.sub_url = sub_url || offer.sub_url;
      offer.unsub_url = unsub_url || offer.unsub_url;
      offer.open_url = open_url || offer.open_url;
      offer.opt_out_url = opt_out_url || offer.opt_out_url;
      offer.sensitive = sensitive || offer.sensitive;
      offer.from_name = from_name || offer.from_name;
      offer.subject = subject || offer.subject;
      offer.restrictions = restrictions || offer.restrictions;

      const updatedOffer = await offer.save();
      res.json(updatedOffer);
    } else {
      res.status(404).json({ message: "Offer not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating offer", error: error.message });
  }
};

module.exports = { addOffer, getOffers, updateOffer };
