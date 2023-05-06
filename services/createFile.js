const multer = require("multer");
const path = require("path");

const createFile = (filePath, requsetPath, fileExtension, inputName, dbKey) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, filePath); // specify the upload directory
    },
    filename: function (req, file, cb) {
      const timestamp = Date.now(); // generate a timestamp
      const ext = path.extname(file.originalname); // get the file extension
      const filename = `${timestamp}${ext ? ext : fileExtension}`; // create the new file name
      req.body[dbKey] = `${process.env.DOMAIN_NAME}/${requsetPath}/${filename}`;
      cb(null, filename);
    },
  });
  const upload = multer({ storage: storage });
  return upload.single(inputName);
};

module.exports = {
  createFile,
};
