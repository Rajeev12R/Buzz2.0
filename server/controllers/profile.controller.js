import User from "../models/User.js";
import Post from "../models/Post.js";
import cloudinary from "../utils/cloudinary.js";
import { createNotification } from "../utils/notificationHelper.js";
import FollowRequest from "../models/FollowRequest.js";
import Notification from "../models/Notification.js";

const getProfileByUsername = async(req, res) => {
    try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    res.json({ user, posts });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

const updateProfile = async(req, res) => {
    try {
    const { fullName, username, bio, isPrivate } = req.body;
    let profilePicUrl = req.body.profilePic;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "buzz_profiles"
      });
      profilePicUrl = result.secure_url;
    }

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (username !== undefined) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePicUrl !== undefined) updateFields.profilePic = profilePicUrl;
    if (isPrivate !== undefined) {
      updateFields.isPrivate = isPrivate === "true" || isPrivate === true;
    }

    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json({ user });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
}


const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params; // person to follow
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userId
      );

      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUserId
      );

      await currentUser.save();
      await userToFollow.save();

      return res.json({
        message: "Unfollowed",
        isFollowing: false,
        hasPendingRequest: false
      });
      
    } else {
      if (userToFollow.isPrivate) {
        const existingRequest = await FollowRequest.findOne({ sender: currentUserId, receiver: userId });
        
        if (existingRequest) {
          await FollowRequest.findByIdAndDelete(existingRequest._id);
          return res.json({ message: "Follow request cancelled", hasPendingRequest: false, isFollowing: false });
        } else {
          await FollowRequest.create({
            sender: currentUserId,
            receiver: userId
          });
          await createNotification({
            sender: currentUserId,
            recipient: userId,
            type: "follow_request"
          });
          return res.json({ message: "Follow request sent", hasPendingRequest: true, isFollowing: false });
        }
      } else {
        currentUser.following.push(userId);
        userToFollow.followers.push(currentUserId);
        
        await createNotification({
          sender: currentUserId,
          recipient: userId,
          type: "follow"
        });

        await currentUser.save();
        await userToFollow.save();

        return res.json({
          message: "Followed",
          isFollowing: true,
          hasPendingRequest: false
        });
      }
    }

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const request = await FollowRequest.findOne({ sender: senderId, receiver: req.user.id });
    
    if (!request) return res.status(404).json({ message: "Request not found" });

    await User.findByIdAndUpdate(request.receiver, { $addToSet: { followers: request.sender } });
    await User.findByIdAndUpdate(request.sender, { $addToSet: { following: request.receiver } });

    await Notification.findOneAndUpdate(
      { sender: request.sender, recipient: request.receiver, type: "follow_request" },
      { type: "request_accepted" }
    );

    await createNotification({
      sender: request.receiver,
      recipient: request.sender,
      type: "accept_request"
    });

    await FollowRequest.findByIdAndDelete(request._id);
    res.json({ message: "Request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const request = await FollowRequest.findOne({ sender: senderId, receiver: req.user.id });
    
    if (!request) return res.status(404).json({ message: "Request not found" });

    await Notification.findOneAndUpdate(
      { sender: request.sender, recipient: request.receiver, type: "follow_request" },
      { type: "request_rejected" }
    );

    await FollowRequest.findByIdAndDelete(request._id);
    res.json({ message: "Request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const users = await User.find({
      _id: {
        $ne: req.user.id,
        $nin: currentUser.following
      }
    }).select("username profilePic");

    res.json({ users });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getConnections = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select("followers following")
      .populate("followers", "username profilePic fullName")
      .populate("following", "username profilePic fullName");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      followers: user.followers,
      following: user.following
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const removeFollower = async (req, res) => {
  try {
    const { followerId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const followerUser = await User.findById(followerId);

    if (!followerUser) return res.status(404).json({ message: "User not found" });

    currentUser.followers = currentUser.followers.filter(id => id.toString() !== followerId);
    followerUser.following = followerUser.following.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await followerUser.save();

    res.json({ message: "Follower removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { getProfileByUsername, updateProfile, getUsersForSidebar, toggleFollow, getSuggestions, acceptRequest, rejectRequest, getConnections, removeFollower };