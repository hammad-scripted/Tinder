import { User } from '../models/users.model.js';

export const updateProfile = async (req, res) => {
  try {
    const { image, ...otherFields } = req.body;

    let updatedData = { ...otherFields };

    if (image) {
      //? base64 image data is sent in the request body, you can handle it here
      if (image.startsWith('data:image')) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'tinder_users',
          });
          updatedData.image = uploadResponse.secure_url;
        } catch (error) {
          console.error('Error uploading image to Cloudinary:', error);
          return res
            .status(500)
            .json({ success: false, message: 'Error uploading image' });
        }
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updatedData,
        { new: true },
      );

      return res.status(200).json({ success: true, user: updatedUser });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
