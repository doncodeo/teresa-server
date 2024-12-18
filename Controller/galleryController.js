const asyncHandler = require('express-async-handler');
const Gallery = require('../Models/galleryModel');
const Family = require('../Models/familyModel');

// Upload Media to Family Gallery
const uploadMedia = asyncHandler(async (req, res) => {
    try {
      const { familyId, mediaEntries } = req.body;
  
      // Validate family existence
      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found.' });
      }
  
      // Validate media entries
      if (!Array.isArray(mediaEntries) || mediaEntries.length === 0) {
        return res.status(400).json({ error: 'Media entries must be a non-empty array.' });
      }
  
      // Create gallery entries
      const galleryEntries = await Gallery.insertMany(
        mediaEntries.map((entry) => ({
          familyId,
          uploadedBy: req.user._id, // Assuming `req.user` is populated by authentication middleware
          mediaType: entry.mediaType,
          mediaUrl: entry.mediaUrl,
          description: entry.description,
        }))
      );
  
      res.status(201).json({ message: 'Media uploaded successfully', galleryEntries });
    } catch (error) {
      console.error('Error uploading media:', error.message);
      res.status(500).json({ error: 'Server error occurred while uploading media.' });
    }
  });
  

// Get Gallery by Family ID
const getGalleryByFamily = asyncHandler(async (req, res) => {
  try {
    const { familyId } = req.params;

    // Validate family existence
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found.' });
    }

    // Fetch gallery entries
    const gallery = await Gallery.find({ familyId });
    res.status(200).json({ gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error.message);
    res.status(500).json({ error: 'Server error occurred while fetching gallery.' });
  }
});

// Update Media Entry
const updateMedia = asyncHandler(async (req, res) => {
  try {
    const { mediaId } = req.params;
    const updates = req.body;

    // Fetch the gallery entry
    const galleryEntry = await Gallery.findById(mediaId);
    if (!galleryEntry) {
      return res.status(404).json({ error: 'Media not found.' });
    }

    // Check if the user is authorized
    const family = await Family.findById(galleryEntry.familyId);
    if (!family || !family.admins.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied. Only family admins can update media.' });
    }

    // Update and save the gallery entry
    Object.assign(galleryEntry, updates);
    await galleryEntry.save();

    res.status(200).json({ message: 'Media updated successfully', galleryEntry });
  } catch (error) {
    console.error('Error updating media:', error.message);
    res.status(500).json({ error: 'Server error occurred while updating media.' });
  }
});

// Delete Media Entry
const deleteMedia = asyncHandler(async (req, res) => {
  try {
    const { mediaId } = req.params;

    // Fetch the gallery entry
    const galleryEntry = await Gallery.findById(mediaId);
    if (!galleryEntry) {
      return res.status(404).json({ error: 'Media not found.' });
    }

    // Check if the user is authorized
    const family = await Family.findById(galleryEntry.familyId);
    if (!family || !family.admins.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied. Only family admins can delete media.' });
    }

    // Delete the gallery entry
    await galleryEntry.deleteOne();

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error.message);
    res.status(500).json({ error: 'Server error occurred while deleting media.' });
  }
});

module.exports = {
  uploadMedia,
  getGalleryByFamily,
  updateMedia,
  deleteMedia,
};
