import Post from "../models/Post.js";
import mongoose from "mongoose";

const getExplorePosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const seed = req.query.seed || "default";
    const limit = 30;
    const skip = (page - 1) * limit;
    const posts = await Post.aggregate([
      {
        $match: {
          author: { $ne: new mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      { $unwind: "$authorDetails" },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: ["$likesCount", 10] },
              { $multiply: ["$commentsCount", 20] }
            ]
          },
          hoursOld: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              3600000 // 1000 * 60 * 60
            ]
          },
          randomFactor: {
            $abs: {
              $mod: [
                { $add: [{ $strLenCP: { $toString: "$_id" } }, { $strLenCP: seed }] },
                50
              ]
            }
          }
        }
      },
      {
        $addFields: {
          recencyScore: {
             $divide: [500, { $add: [{ $pow: ["$hoursOld", 0.5] }, 1] }]
          }
        }
      },
      {
        $addFields: {
          finalScore: {
            $add: ["$engagementScore", "$recencyScore", "$randomFactor"]
          }
        }
      },
      { $sort: { finalScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          image: 1,
          caption: 1,
          likes: 1,
          likesCount: 1,
          commentsCount: 1,
          comments: 1,
          createdAt: 1,
          score: "$finalScore",
          author: {
            _id: "$authorDetails._id",
            username: "$authorDetails.username",
            profilePic: "$authorDetails.profilePic",
            followers: "$authorDetails.followers"
          }
        }
      }
    ]);

    res.json({ 
      posts, 
      hasMore: posts.length === limit,
      page,
      seed
    });
  } catch (error) {
    console.error("Explore Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchExplore = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json({ posts: [] });
    }

    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      { $unwind: "$authorDetails" },
      {
        $match: {
          $or: [
            { caption: { $regex: query, $options: "i" } },
            { "authorDetails.username": { $regex: query, $options: "i" } }
          ]
        }
      },
      { $limit: 30 },

      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          image: 1,
          caption: 1,
          likes: 1,
          likesCount: 1,
          commentsCount: 1,
          comments: 1,
          createdAt: 1,
          author: {
            _id: "$authorDetails._id",
            username: "$authorDetails.username",
            profilePic: "$authorDetails.profilePic",
            followers: "$authorDetails.followers"
          }
        }
      }
    ]);

    res.json({ posts });

  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {getExplorePosts, searchExplore};