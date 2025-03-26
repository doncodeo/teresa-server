const multer = require('multer');
const cloudinary = require('./cloudinaryConfig'); // This should work if both files are in config/
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const folder = req.uploadFolder || 'default';
    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: `${file.fieldname}-${Date.now()}`,
    }; 
  },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(file.originalname.toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only images (jpg, png, jpeg) are allowed!'));
    },
  });
  
module.exports = upload; 