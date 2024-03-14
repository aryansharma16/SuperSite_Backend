const express = require("express");
const dotenv = require("dotenv");
const color = require("colors");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Importing CORS middleware
const cors = require("cors");

const { notFound, errorHandler } = require("./middlewares/errorMidlleWare");
const path = require("path");

const app = express();
dotenv.config();
connectDB();
app.use(express.json()); // this will tell server to accept the json data from the frontend
app.get("/", (req, res) => {
  res.send("API is Running server is Okk");
});
 


// Setting up CORS
app.use(cors());


app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);




// error Hnadler MiddleWare
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5200;
const server = app.listen(
  PORT,
  console.log(`Server is Started on Port ${PORT}`.yellow.bold)
);

// Setup the Socket.io in our SERVER
const io = require("socket.io")(server, {
  pingTimeout: 60000, // it will wait for 60sec before it goes off if the user willl not send the any message within 60 s it will close the connections to save the band width
  cors: {
    origin: "http://localhost:3000", // to tackle the cross origin problems while buiding the appp
    // credentials: true,
  },
});

// create a connection

io.on("connection", (socket) => {
  console.log("Connected To the Socket.Io..".red.bold);

  // now setup the socket and this will take user data from frontend
  // front end will send some data and will join the room
  socket.on("setup", (userData) => {
    // socket.join create the new room with ID of the user Data and
    // this room will be the exclusive to the particular user ID only
    socket.join(userData._id);
    console.log(userData._id, "Got user id from frontend/client");
    socket.emit("connected");
  });

  // Join The Chat / Room   , name of room = "join chat"
  socket.on("join chat", (room) => {
    socket.join(room); // this should create a room for particular user and other user as well
    // and when other user joins this will add that user to room
    console.log("User Joined Room: " + room);
  });

  // New Socket for typing is user typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));

  // New Socket for stoped  typing is user stoped typing
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // for new messages
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");
    // new message recieve for other usrs in chat or room
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      // dont want myself to my  message

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // we will close the socket becuse it consume lot of bandwidth
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id); // socket will leave the room that we created
  });
});
