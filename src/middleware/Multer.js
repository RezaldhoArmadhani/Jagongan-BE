const multer = require('multer')
const path = require('path');

const maxSize = 2000 * 1000

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/upload')
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.png')
  },
  onFileUploadStart: function (file, req, res) {
    if (req.files.file.length > maxSize) {
      return false
    }
  },
})

const upload = multer({
  storage: storage,

  limits: {
    fileSize: maxSize
  },

  fileFilter: function (req, file, cb) {
    const arrTypeImg = [".jpg", ".png", ".jpeg"]
    const ext = path.extname(file.originalname);
    if (!arrTypeImg.includes(ext.toLowerCase())) {
      return cb(new Error('Only Extention images jpg, png, jpeg, gif!'))
    }
    cb(null, true)
  }
}).single('photo');


module.exports = upload