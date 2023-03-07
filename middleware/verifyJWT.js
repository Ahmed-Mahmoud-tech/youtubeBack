const jwt = require("jsonwebtoken");
const User = require("../model/User");
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      //!refreshToken

      const cookies = req.cookies;
      if (!cookies?.jwt) {
        return res.sendStatus(401);
      }
      const refreshToken = cookies.jwt;
      res.clearCookie("jwt", {
        httpOnly: true,
        // sameSite: "None",
        // secure: true,
      });

      // evaluate jwt
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, refreshDecoded) => {
          if (err) return res.sendStatus(403);
          const foundUser = await User.findOne({
            username: refreshDecoded.username,
          }).exec();

          // Refresh token was still valid
          const roles = Object.values(foundUser.roles);
          const id = foundUser._id;
          const accessToken = jwt.sign(
            {
              UserInfo: {
                username: foundUser.username,
                roles,
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

          // Creates Secure Cookie with refresh token
          res.cookie("jwt", newRefreshToken, {
            httpOnly: true,
            // secure: true,
            // sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000,
          });
          res.set({ token: accessToken });

          req.user = foundUser.username;
          req.roles = foundUser.roles;
          req.id = foundUser._id;
          next();
        }
      );
    } else {
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      req.id = decoded.UserInfo.id;
      next();
    }
  });
};

module.exports = verifyJWT;
