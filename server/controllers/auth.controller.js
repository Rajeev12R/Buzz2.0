import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      })
    }
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    })
  }
}

const registerUser = async (req, res) => {
  try {
    const { fullName, username, password } = req.body

    if (!fullName || !username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      })
    }
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      fullName,
      username,
      password: hashedPassword,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    })
  }
}

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    return res.status(200).json({
      user,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    })
  }
}

const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export { loginUser, registerUser, logoutUser, getProfile }
