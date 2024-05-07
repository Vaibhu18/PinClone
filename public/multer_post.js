const multer = require("multer")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const fs = require('fs');

const postDir = path.join(__dirname, 'posts');

// Check if the directory exists, if not, create it
if (!fs.existsSync(postDir)) {
  fs.mkdirSync(postDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: postDir,
  filename: function (req, file, cb) {
    const uniqueId = uuidv4()
    cb(null, uniqueId + path.extname(file.originalname))
  }
})

module.exports = multer({ storage: storage })