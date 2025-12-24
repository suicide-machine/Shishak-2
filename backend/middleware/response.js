module.exports = (req, res, next) => {
  res.ok = (data = {}, message = "OK", meta = {}) =>
    res.status(200).json({ success: true, message, data, meta })

  next()
}
