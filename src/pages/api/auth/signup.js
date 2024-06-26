import dbConnect from "@/utils/dbConnect";
import User from "@/models/user";
import UserResources from "@/models/userResources";
import Garden from "@/models/garden";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === "POST") {
    try {
      const { email, password, username } = req.body;

      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (exists) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        email,
        username,
        password: hashedPassword,
      });

      await user.save();

      const plots = [];
      for (let x = 0; x <= 5; x++) {
        for (let y = 0; y <= 6; y++) {
          if (plots.length < 35) {
            plots.push({
              x,
              y,
              plant: "weed",
              empty: true,
            });
          }
        }
      }

      const garden = new Garden({
        userId: user._id,
        plots,
      });

      await garden.save();

      const userResources = new UserResources({
        userId: user._id,
        water: 6,
        seeds: 3,
        soil: 3,
      });

      await userResources.save();

      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
