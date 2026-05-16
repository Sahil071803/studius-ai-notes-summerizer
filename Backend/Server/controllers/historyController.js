const History = require("../models/History");

const getHistory = async (req, res) => {
  try {
    const userId = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      History.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      History.countDocuments({ userId }),
    ]);

    res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    await History.findOneAndDelete({ _id: id, userId });

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, summary } = req.body;
    const userId = req.user;

    const updated = await History.findOneAndUpdate(
      { _id: id, userId },
      { text, summary },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getHistory, deleteHistory, updateHistory };