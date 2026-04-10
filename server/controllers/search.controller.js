import User from "../models/User.js"

const searchUser = async (req, res) => {
    try {
        const { query } = req.query

        if (!query || query.trim() === "") {
            return res.json({ users: [] })
        }

        const search = query.trim()

        const users = await User.find({
            _id: {
                $ne: req.user.id,
            },
            $or: [
                { username: { $regex: search, $options: "i" } },
                { fullName: { $regex: search, $options: "i" } },
            ],
        })
            .select("username fullName profilePic")
            .limit(10);

        res.json({ users });

    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

export { searchUser };