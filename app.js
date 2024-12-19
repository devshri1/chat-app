var express = require("express");
const app = express();
var http = require("http");
const server = http.createServer(app);
var { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
const { userJoin, delUser, _delUser, noOfUser } = require("./imp/userArray.js");
const moment = require("moment");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");

mongoose
  .connect(
    // "mongodb+srv://chatusername:chatuserpass@cluster0.er9bgkb.mongodb.net/"
    "mongodb+srv://navinkumarray29233:Navin%401208@cluster0.id1zk.mongodb.net/"
  )
  .then(() => console.log("connection to db successfull..."))
  .catch((err) => console.log(err));

const Register = require("./public/register");
const { urlencoded } = require("express");

// const registeredUserSchema = new mongoose.Schema({
//    firstName: String,
//    lastName: String,
//    userName: String,
//    password: Number
// })

// const registeredUsers = new mongoose.model("registereduser",registeredUserSchema);

// async function createDocument(){
//    try{

//       const insertUser = new registeredUsers({
//          firstName: "Arsalan",
//          lastName: "Khan",
//          userName: "khanar7866",
//          password: 12345
//       });
//       await insertUser.save();
//    }
//    catch(err){
//       console.log(err);
//    }
// }
// createDocument();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Get Method --Express
app.get("/", function (req, res) {});

app.post("/register", async (req, res) => {
  try {
    const registeringuser = new Register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    const result = await registeringuser.save();
    res.status(201).sendFile(path.join(__dirname, "/public/index.html"));
  } catch (err) {
    console.log(err);
  }
});
var dbusername = "";
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const regis = await Register.findOne({ email: email });
    if (regis.password === password) {
      dbusername = regis.username;
      res.status(201).sendFile(path.join(__dirname, "/public/chat.html"));
    } else res.send("Login details wrong");
  } catch (err) {
    console.log(err);
    res.send("Login details wrong hai...");
  }
});
io.on("connection", (socket) => {
  console.log("A user connected");
  io.to(socket.id).emit("updater", dbusername);
  socket.on("JoiningEvent", (username) => {
    const user = userJoin(dbusername, socket.id);
    let cnt = noOfUser();
    io.emit("OnlineUsers", user, cnt);
    socket.broadcast.emit("recieveJoiningName", dbusername);
  });

  socket.on("message", (msg, Username) => {
    console.log(msg, Username);
    var date = moment().format("h:mm a");
    socket.broadcast.emit("receive-msg", socket.id, Username, msg, date);
  });

  // when someone wants to send private msg
  socket.on("PrivateMsg", (msg, username, user_ID) => {
    console.log("msg:", msg);
    console.log("username:", username);
    console.log("user_ID:", user_ID);
    var date = moment().format("h:mm a");
    console.log("The date is ", date);
    socket.broadcast
      .to(user_ID)
      .emit("receivePrivateMsg", socket.id, msg, username, date);
  });
  socket.on("typingStatus", (senderName, senderId, recieverId) => {
    let sName = senderName;
    socket.broadcast.to(recieverId).emit("showTyping", sName, senderId);
  });
  // whenever someone disconnects this piece of code executed
  socket.on("disconnect", function () {
    const leftUser = _delUser(socket.id);
    const users = delUser(socket.id);
    let cnt = noOfUser();
    io.emit("DC", leftUser);
    io.emit("OnlineUsers", users, cnt);

    console.log("Successful deletion");
  });

  console.log("A user disconnected");
});

server.listen(port, function () {
  console.log(`listening on ${port}`);
});
