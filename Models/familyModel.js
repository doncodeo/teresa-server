const mongoose = require('mongoose');
const crypto = require('crypto');

const generateFamilyCode = (familyName) => {
  // Generate a random 3-character alphanumeric string
  const randomString = crypto.randomBytes(1).toString('hex').toUpperCase();

  // Take the first three letters of the family name (or less if family name is shorter)
  const namePrefix = familyName.substring(0, 3).toUpperCase();

  // Combine the random string and name prefix to form the family code
  return `${namePrefix}${randomString}`;
};

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  familyCode: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return generateFamilyCode(this.name);
    }
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Father', 'Mother', 'Son', 'Daughter', 'Cousin', 'Uncle', 'Aunt', 'Grandparent', 'Sibling', 'Other'],
      required: true
    }
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: true // Adds updatedAt field automatically
});

const Family = mongoose.model('Family', familySchema);

module.exports = Family;
