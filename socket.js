module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("connected!", socket.id);
  });
};
