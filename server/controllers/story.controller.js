import Story from "../models/Story.js"
import User from "../models/User.js"
import cloudinary from "../utils/cloudinary.js"

const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media is required" })
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const isVideo = req.file.mimetype.startsWith("video");
    
    // We can limit maximum duration for videos if desired by cloudinary configuration or local buffer checks
    // But Cloudinary automatically processes it. We mark type explicitly.

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "buzz_stories"
    });

    const story = await Story.create({
      user: req.user.id,
      media: result.secure_url,
      mediaType: isVideo ? "video" : "image",
    })

    res.status(201).json({ story })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

const getStories = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.id);
    const followingAndMe = [...loggedInUser.following, req.user.id];

    const stories = await Story.find({ user: { $in: followingAndMe } })
      .populate("user", "username profilePic fullName")
      .sort({ createdAt: -1 })

    const grouped = {}

    stories.forEach((story) => {
      const userId = story.user._id.toString()
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.user,
          stories: [],
        }
      }
      grouped[userId].stories.push(story)
    })
    res.json({ stories: Object.values(grouped) })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export { createStory, getStories };
