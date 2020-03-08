// catch async is kind of a wrapper function over async middleware so that we don't need try catch block  inside the middleware
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
