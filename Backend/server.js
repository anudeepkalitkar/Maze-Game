const path = require("path");
const http = require("http");
const {
	AddPlayer,
	UpdateRoomDetails,
	GetRoomPlayers,
	GetRoomID,
	GetUserDetails,
	GetRoomDetails,
	GetScoreBoard,
	UserLeft,
	UpdateUserScore
} = require("./utils/Usermanagement");

const {
	GetRandomInt,
	GenerateHorizontalMaze,
	GenerateVerticalMaze,
	GenerateRandomMaze,
	SolveMaze,
	CalcUserScore
} = require("./utils/Gameboard");
const express = require("express");
// const { v4: uuidv4 } = require("uuid");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
})

app.get('/ping', (req, res) => {
	res.send('pong')
  })
  

io.on("connection", (socket) => {
	// console.log("New Socket Connection", socket.id);

	socket.on("GetRoomID", ({ roomType }) => {
		let roomID = GetRoomID(roomType);
		if (roomType === "private") {
			socket.emit("privateRoomID", roomID);
		} else {
			socket.emit("roomID", roomID);
		}
		// console.log("roomID", roomID, socket.id);
	});

	socket.on("AddPlayer", ({ username, userEmoji, roomID }) => {
		let user = {};
		user = AddPlayer(socket.id, username, userEmoji, roomID);
		socket.join(user.roomID);
		// console.log("User joined", user);
		let roomPlayers = GetRoomPlayers(user.roomID)
		socket.broadcast.to(user.roomID).emit("Players", roomPlayers);
		// socket.emit("Players", roomPlayers);
	});

	socket.on("GetPlayers", ()=>{
		let user = GetUserDetails(socket.id);
		let roomPlayers = GetRoomPlayers(user.roomID);
		socket.broadcast.to(user.roomID).emit("Players", roomPlayers);
		socket.emit("Players", roomPlayers);
		// console.log("Users in Lobby", roomPlayers);
	});

	socket.on("UpdateLobby", ({ rounds, solvingTime, gamePlay }) => {
		let user = GetUserDetails(socket.id);
		UpdateRoomDetails(user.roomID, "NewGameSettings", rounds, solvingTime, gamePlay);
		socket.broadcast.to(user.roomID).emit("NewGameSettings",rounds, solvingTime, gamePlay);
		// console.log("Game Setting has been changed to", rounds, solvingTime, gamePlay);
	});


	socket.on("GenerateMaze", (round) => {
		let maze = null
		let user = GetUserDetails(socket.id)
		let room = GetRoomDetails(user.roomID)
		let gamePlay = room.gamePlay
		if(gamePlay === 2){
			maze = GenerateRandomMaze(round + 5)
		}
		else{if(GetRandomInt(1)){
			maze = GenerateHorizontalMaze(round+1)
		}
		else{
			maze = GenerateVerticalMaze(round+1);
		}}
		// console.log("NewMaze",maze);
		socket.emit("NewMaze", maze);
		socket.broadcast.to(user.roomID).emit("NewMaze", maze);
		let newShortestPath = SolveMaze(maze);
		// console.log("shortestPath", newShortestPath);
		UpdateRoomDetails(user.roomID, "NewShortestPath", null, null, null, newShortestPath );
	});

	socket.on("GetScoreBoard", () =>{
		let user = GetUserDetails(socket.id);
		let leaderBoard = GetScoreBoard(user.roomID);
		socket.emit("ScoreBoard", leaderBoard);
		socket.broadcast.to(user.roomID).emit("ScoreBoard", leaderBoard);
	});
	
	socket.on("GetShortestPath", () =>{
		let user = GetUserDetails(socket.id);
		let room = GetRoomDetails(user.roomID);
		let shortestPath = room.shortestPath;
		socket.broadcast.to(user.roomID).emit("ShortestPath", shortestPath);
		socket.emit("ShortestPath", shortestPath);

	});
	socket.on("GameStarted",()=>{
		let user = GetUserDetails(socket.id);
		// socket.emit("GameStarted");
		socket.broadcast.to(user.roomID).emit("GameStarted");
	});
	socket.on("GetUserScore", ({userPath}) =>{
		// console.log("userPath", userPath)
		let user = GetUserDetails(socket.id);
		let shortestPath  =  GetRoomDetails(user.roomID).shortestPath
		let score  = CalcUserScore(shortestPath, userPath)
		// console.log("UpdateUserScore", UpdateUserScore(socket.id,score))
		UpdateUserScore(socket.id,score);
		socket.emit("UserScore", score);
		socket.broadcast.to(user.roomID).emit("UserScore", score);
	});
	socket.on('NewChatMessage', ({newMsg}) => {
		let user = GetUserDetails(socket.id);
		let userName = user.username;
		let msg = [userName, newMsg];
		console.log(msg);
        socket.broadcast.to(user.roomID).emit("NewChatMessage",msg );
    });
	socket.on("GameFinished",()=>{
		let user = GetUserDetails(socket.id);
		// socket.emit("GameFinished");
		socket.broadcast.to(user.roomID).emit("GameFinished");
	});


	socket.on("disconnect", () => {
		// console.log("disconnected");
		let user = UserLeft(socket.id);
		// let room = GetRoomDetails(user.roomID);
		try{let roomPlayers = GetRoomPlayers(user.roomID);
		socket.broadcast.to(user.roomID).emit("UserLeft", roomPlayers);}
		catch{}
	});
});

const PORT = process.env.PORT || 4001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
