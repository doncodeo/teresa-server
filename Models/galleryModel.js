const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mediaUrl: {
    type: String, // URL where the file is stored (e.g., YouTube, external platforms)
    required: true
  },
  description: {
    type: String,
    default: '' // Optional description
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;



// const mongoose = require('mongoose');

// const gallerySchema = new mongoose.Schema({
//   familyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Family',
//     required: true
//   },
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true 
//   },
//   mediaType: {
//     type: String,
//     enum: ['image', 'video'],
//     required: true
//   },
//   mediaUrl: {
//     type: String, // URL where the file is stored (e.g., Cloudinary, AWS S3)
//     required: true
//   },
//   description: String,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const Gallery = mongoose.model('Gallery', gallerySchema);
// module.exports = Gallery;
