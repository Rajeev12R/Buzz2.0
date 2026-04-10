import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { createNotification } from "../utils/notificationHelper.js";

const addComment = async (req, res) => {
  try {
    const { postId, text, parentComment } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text required" });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user.id,
      text,
      parentComment: parentComment || null
    });

    const post = await Post.findById(postId);
    if (post && post.author.toString() !== req.user.id) {
      await createNotification({
        sender: req.user.id,
        recipient: post.author,
        type: "comment",
        post: postId,
        text
      });
    }

    res.status(201).json({ comment });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
      parentComment: null
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json({ comments });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({
      parentComment: commentId
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: 1 });

    res.json({ replies });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {addComment, getComments, getReplies};