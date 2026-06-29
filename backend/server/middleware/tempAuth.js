// TEMPORARY — replace with JWT auth on Day 4
module.exports = (req, res, next) => {
  req.user = { id: "temp-user-001", name: "Trupti" };
  next();
};
