const multer = require("multer")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const fs = require('fs');

const profilesDir = path.join(__dirname, 'profiles');

// Check if the directory exists, if not, create it
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true }); 
}

const storage = multer.diskStorage({
  destination: profilesDir,
  filename: function (req, file, cb) {
    const uniqueId = uuidv4()
    cb(null, uniqueId + path.extname(file.originalname))
  }
})

module.exports = multer({ storage: storage })