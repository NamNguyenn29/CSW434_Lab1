const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Chat Socket.IO server is running!");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Client tham gia một group chat
  socket.on("join_group", ({ groupId, username }) => {
    if (
      typeof groupId !== "string" ||
      !groupId.trim() ||
      typeof username !== "string" ||
      !username.trim()
    ) {
      return;
    }

    socket.join(groupId);

    socket.data.groupId = groupId;
    socket.data.username = username.trim();

    console.log(`${username} joined group ${groupId}`);

    socket.emit("joined_group", {
      groupId,
      username: username.trim(),
    });
  });

  // Nhận và broadcast tin nhắn
  socket.on("send_message", (data) => {
    const groupId = socket.data.groupId;
    const username = socket.data.username;

    if (!groupId || !username) return;
    if (typeof data?.text !== "string") return;

    const text = data.text.trim();

    if (!text || text.length > 2000) return;

    const message = {
      id: `${Date.now()}-${socket.id}`,
      groupId,
      username,
      text,
      time: new Date().toISOString(),
    };

    // Gửi tin nhắn cho mọi client trong phòng,
    // bao gồm cả người gửi.
    io.to(groupId).emit("receive_message", message);

    console.log(`[${groupId}] ${username}: ${text}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, reason);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chat server running on port ${PORT}`);
});
