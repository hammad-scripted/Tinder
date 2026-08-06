import { User } from '../models/users.model.js';
import { getConnectedUsers, getIO } from '../socket/socket.server.js';
// ==========================================
// 1. SWIPE RIGHT (Like / Match Logic)
// ==========================================
export const swipeRight = async (req, res) => {
  try {
    const { likedUserId } = req.params;
    const currentUserId = req.user._id;

    // Prevent swiping on yourself
    if (currentUserId.toString() === likedUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot swipe right on yourself',
      });
    }

    const likedUser = await User.findById(likedUserId);
    if (!likedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Check if the other user already liked the current user (Mutual Match!)
    const isMatch = likedUser.likes.includes(currentUserId);

    if (isMatch) {
      // 🤝 MUTUAL MATCH: Add to both users' matches arrays & clean up likes
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $addToSet: { matches: likedUserId },
          $pull: { likes: likedUserId },
        }),
        User.findByIdAndUpdate(likedUserId, {
          $addToSet: { matches: currentUserId },
          $pull: { likes: currentUserId },
        }),
      ]);
      // TODO: Send mutual match real-time notification (e.g., Socket.io)

      //* send the notification to the matched users
      const connectedUsers = getConnectedUsers();
      const likedUserSocketId = connectedUsers.get(likedUserId.toString());
      const io = getIO();
      if (likedUserSocketId) {
        io.to(likedUserSocketId).emit('newMatch', {
          _id: currentUserId.toString(),
          name: req.user.name,
          profileImage: req.user.image,
        });
      }

      const currentSocketId = connectedUsers.get(currentUserId.toString());
      if (currentSocketId) {
        io.to(currentSocketId).emit('newMatch', {
          _id: likedUserId.toString(),
          name: likedUser.name,
          profileImage: likedUser.image,
        });
      }
      return res.status(200).json({
        success: true,
        isMatch: true,
        message: "It's a match 💕!",
      });
    } else {
      // 💖 NOT A MATCH YET: Just add likedUserId to currentUser's likes array
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { likes: likedUserId },
      });

      // TODO: Send "someone liked you" notification to likedUser

      return res.status(200).json({
        success: true,
        isMatch: false,
        message: 'Liked user successfully',
      });
    }
  } catch (err) {
    console.error('Error in swipeRight:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 2. SWIPE LEFT (Dislike Logic)
// ==========================================
export const swipeLeft = async (req, res) => {
  try {
    const { dislikedUserId } = req.params;
    const currentUserId = req.user._id;

    // Prevent swiping on yourself
    if (currentUserId.toString() === dislikedUserId) {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot swipe left on yourself' });
    }

    // Atomic update to add to dislikes array without duplication
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { dislikes: dislikedUserId },
    });

    return res
      .status(200)
      .json({ success: true, message: 'Disliked user successfully' });
  } catch (err) {
    console.error('Error in swipeLeft:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// 3. GET MATCHES
// ==========================================
export const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'matches',
      'name image bio age gender',
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, matches: user.matches });
  } catch (err) {
    console.error('Error in getMatches:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// 4. GET USER PROFILES (Swipe Deck)
// ==========================================
export const getUserProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser._id } },
        { _id: { $nin: currentUser.likes } },
        { _id: { $nin: currentUser.dislikes } },
        { _id: { $nin: currentUser.matches } },
        {
          gender:
            currentUser.genderPreference === 'both'
              ? { $in: ['male', 'female'] }
              : currentUser.genderPreference,
        },
        {
          genderPreference: {
            $in: [currentUser.gender, 'both'],
          },
        },
      ],
    })
      .select('-password -email'). // Hide sensitive fields
      sort({ createdAt: -1 }).limit(50); // Prevent loading thousands of users at once

    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Error in getUserProfiles:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
