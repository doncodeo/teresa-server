const mongoose = require('mongoose');
const crypto = require('crypto');

const generateFamilyCode = (familyName) => {
  const randomString = crypto.randomBytes(1).toString('hex').toUpperCase();
  const namePrefix = familyName.substring(0, 3).toUpperCase();
  return `${namePrefix}${randomString}`;
};

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  familyCode: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return generateFamilyCode(this.name);
    },
  },
  joinToken: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex'),
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['Father', 'Mother', 'Son', 'Daughter', 'Cousin', 'Uncle', 'Aunt', 'Grandparent', 'Sibling', 'Other'],
      required: true,
    },
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movies: [{
    title: String,
    description: String,
    link: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  gallery: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  profilePicture: {
    url: { type: String },
    publicId: { type: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Family = mongoose.model('Family', familySchema);
module.exports = Family;


// const mongoose = require('mongoose');
// const crypto = require('crypto');

// const generateFamilyCode = (familyName) => {
//   // Generate a random 3-character alphanumeric string
//   const randomString = crypto.randomBytes(1).toString('hex').toUpperCase();

//   // Take the first three letters of the family name (or less if family name is shorter)
//   const namePrefix = familyName.substring(0, 3).toUpperCase();

//   // Combine the random string and name prefix to form the family code
//   return `${namePrefix}${randomString}`;
// };

// const familySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   description: String,
//   familyCode: {
//     type: String,
//     required: true,
//     unique: true,
//     default: function() {
//       return generateFamilyCode(this.name);  // Call the function to generate family code
//     }
//   },
//   joinToken: {
//     type: String,
//     required: true,
//     unique: true,
//     default: () => crypto.randomBytes(16).toString('hex'), // Generates a 32-char token
//   },
  
//   members: [{
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     role: {
//       type: String,
//       enum: ['Father', 'Mother', 'Son', 'Daughter', 'Cousin', 'Uncle', 'Aunt', 'Grandparent', 'Sibling', 'Other'],
//       required: true
//     }
//   }],
//   admins: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   movies: [{
//     title: String,
//     description: String,
//     link: String, // e.g., YouTube or other platform URL
//     addedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   gallery: [{
//     imageUrl: String,
//     description: String,
//     uploadedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
// }, {
//   timestamps: true // Adds updatedAt field automatically
// });
// const Family = mongoose.model('Family', familySchema);

// module.exports = Family;

