const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (cookies?.jwt)
    return res.clearCookie("jwt", {
      httpOnly: true,
      // sameSite: "None",
      // secure: true,
    });
  res.sendStatus(204);
};

module.exports = { handleLogout };
