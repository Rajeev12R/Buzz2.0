import Post from "../models/Post.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import { createNotification } from "../utils/notificationHelper.js";

const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "buzz_posts"
    });

    const newPost = new Post({
      author: req.user.id,
      caption: caption || "",
      image: result.secure_url
    });

    await newPost.save();
    return res.status(201).json({ message: "Post created successfully", post: newPost });
    
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Failed to create post" });
  }
}

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    if (caption !== undefined) {
      post.caption = caption;
    }

    await post.save();
    return res.status(200).json({ message: "Post updated successfully", post });

  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Failed to update post" });
  }
}

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: "Post deleted successfully" });

  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Failed to delete post" });
  }
}
const getAllPost = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.id);
    const followingAndMe = [...loggedInUser.following, req.user.id];

    const posts = await Post.find({ author: { $in: followingAndMe } })
      .populate("author", "username profilePic fullName")
      .sort({ createdAt: -1 });
      
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
}

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);

      if (post.author.toString() !== userId) {
        await createNotification({
          sender: userId,
          recipient: post.author,
          type: "like",
          post: post._id
        });
      }
    }

    await post.save();

    res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      isLiked: !isLiked
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



export { createPost, updatePost, deletePost, getAllPost, toggleLike};