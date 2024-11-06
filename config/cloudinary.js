const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: 'di97mcvbu', 
  api_key: '649215536597282', 
  api_secret: 'm66QC6fQqFBAR-TzzJ0idbwpcv8' 
});

module.exports = cloudinary;