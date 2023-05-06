const Report = require("../model/Report");
const Video = require("../model/Video");
// when create report add id to user or video and when delete remove
// test api on postman

//! update video service

// const getAllReports = async (req, res) => {
//   const limit = parseInt(req.query.limit) || 10;
//   const page = parseInt(req.query.page) || 1;

//   try {
//     const reports = await Report.find()
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .exec();
//     res.send(reports);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send();
//   }
// };

const createNewReport = async (req, res) => {
  if (req.body.reason && req.body.comment && req.body.video) {
    try {
      const newReport = await Report.create({
        ...req.body,
        author: req.userId,
      });

      await Video.findByIdAndUpdate(req.body.video, {
        $push: { report: newReport._id },
      });

      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required field error" });
  }
};

const patchReport = async (req, res) => {
  const updates = Object.keys(req.body);

  //! patch validation
  const allowedUpdates = ["reason", "comment"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).send();
    }

    updates.forEach((update) => (report[update] = req.body[update]));
    await report.save();

    res.send(report);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteReport = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "Report ID required." });

  // const report = await Report.findByIdAndDelete(req.body.id);
  const report = await Report.findById(req.body.id);

  if (!report) {
    return res
      .status(404)
      .json({ message: `No report matches ID ${req.body.id}.` });
  }

  await Video.findByIdAndUpdate(req.body.video, {
    $pull: { report: req.body.id },
  });

  // delete report itself
  await Report.findByIdAndDelete(req.body.id);

  res.send("removed");
};

const getReport = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Report ID required." });
  const report = await Report.findOne({ _id: req.params.id }).exec();

  if (!report) {
    return res
      .status(204)
      .json({ message: `No report matches ID ${req.params.id}.` });
  }
  res.json(report);
};

module.exports = {
  // getAllReports,
  createNewReport,
  patchReport,
  deleteReport,
  getReport,
};
