/**
 * socketService.js
 *
 * A singleton that holds the Socket.io `io` instance.
 * Workers import `{ getIo }` and call io.to(campaignId).emit(...)
 * without needing to import the entire HTTP server.
 */

let _io = null;

/**
 * Called once from index.js after the HTTP server is created.
 * @param {import('socket.io').Server} io
 */
const init = (io) => {
  _io = io;

  io.on("connection", (socket) => {
    // Client joins a campaign-specific room
    socket.on("join_campaign", (campaignId) => {
      if (campaignId) {
        socket.join(String(campaignId));
        console.log(`[Socket] Client joined room: ${campaignId}`);
      }
    });

    // Client leaves the room (e.g. navigates away)
    socket.on("leave_campaign", (campaignId) => {
      if (campaignId) {
        socket.leave(String(campaignId));
        console.log(`[Socket] Client left room: ${campaignId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Returns the Socket.io `io` instance.
 * Safe to call even before init — it will be null and workers skip the emit.
 */
const getIo = () => _io;

/**
 * Convenience helper: emit a 'new_log' event to a specific campaign room.
 * No-ops silently if the socket server isn't ready yet.
 * @param {string} campaignId
 * @param {object} log
 */
const emitLog = (campaignId, log) => {
  if (_io && campaignId && log) {
    _io.to(String(campaignId)).emit("new_log", log);
  }
};

module.exports = { init, getIo, emitLog };
