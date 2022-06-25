var jwt = require('jsonwebtoken');
const   JWT_SECRET='harryisagoodboy'
//GET the user from the jwt using the auth token

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(400).send({ error: "please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(400).send({ error: "please authenticate using  valid token" });
  }
};

module.exports = fetchuser;
