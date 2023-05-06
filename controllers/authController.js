const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const cookies = req.cookies;

  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const foundUser = await User.findOne({ username: user }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  const id = foundUser._id;
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create JWTs

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
          id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15s" }
    );

    const newRefreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    if (cookies?.jwt) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user

    const userInfoKeys = [
      "username",
      "roles",
      "avatar",
      "fullName",
      "age",
      "email",
      "phone",
      "mainVideo",
    ];
    const userInfo = {};
    for (let index = 0; index < userInfoKeys.length; index++) {
      if ([userInfoKeys[index]] == "roles") {
        userInfo["roles"] = Object.keys(foundUser[userInfoKeys[index]]);
      } else {
        userInfo[userInfoKeys[index]] = foundUser[userInfoKeys[index]];
      }
    }
    userInfo.accessToken = accessToken;
    // foundUser._doc.accessToken = accessToken;
    res.json({ userInfo });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
