const { v4: uuidv4 } = require("uuid");
const users = [];
const rooms = [];
// const user = { userID, username, userEmoji, userType, roomID, score };
// let room = { roomID, userCount, roomType, rounds, solvingTime, gamePlay };

const AddPlayer = (userID, username, userEmoji, roomID) => {
	let score = 0;
	let userType = "Player";
	let index = rooms.findIndex((room) => room.roomID === roomID);
	const userCount = rooms[index].userCount;
	if (userCount === 0) userType = "Admin";
	const user = { userID, username, userEmoji, userType, roomID, score };
	users.push(user);
	UpdateRoomDetails(roomID, "NewPlayer");
	return user;
};

const UpdateRoomDetails = (roomID, updateType, rounds = 5, solvingTime = 60, gamePlay = 0, shortestPath = null) => {
	let index = rooms.findIndex((room) => room.roomID === roomID);
	if (index === -1) {
		return false;
	}
	if (updateType === "NewPlayer") {
		rooms[index].userCount += 1;
	} else if (updateType === "NewGameSettings") {
		rooms[index].rounds = rounds;
		rooms[index].solvingTime = solvingTime;
		rooms[index].gamePlay = gamePlay;
	} else if (updateType === "UserLeft") {
		if (rooms[index].userCount === 1) {
			rooms.splice(index, 1)[0];
		} else {
			rooms[index].userCount -= 1;
		}
	}
	else if(updateType === "NewShortestPath"){
		// console.log("NewShortestPath", shortestPath)
		rooms[index].shortestPath = shortestPath;
	}
	return true;
};

const GetRoomPlayers = (roomID) => {
	return users.filter((user) => user.roomID === roomID);
};

const GetRoomID = (roomType, rounds = 5, solvingTime = 60, gamePlay = 0) => {
	let roomID = uuidv4();
	let userCount = 0;
	let shortestPath = null;
	if (roomType === "public") {
		let publicRooms = rooms.filter((room) => room.roomType === roomType);
		if (publicRooms.length > 10) {
			roomID = publicRooms.sort((a, b) => a.userCount - b.userCount)[0].roomid;
		}
	}
	let room = { roomID, userCount, roomType, rounds, solvingTime, gamePlay, shortestPath };
	rooms.push(room);
	return roomID;
};

const GetUserDetails = (userID) => {
	let user = users.find((user) => user.userID === userID);
	if (!user) {
		return null;
	}
	return user;
};

const GetRoomDetails = (roomID) => {
	let room = rooms.find(room => room.roomID === roomID);
	if (!room) {
		return null;
	}
	return room;
}

const UserLeft = (userID) => {
	let index = users.findIndex((user) => user.userID === userID);
	if (index === -1) {
		return null;
	}
	UpdateRoomDetails(users[index].roomID, "UserLeft");
	return users.splice(index, 1)[0];
};

const UpdateUserScore = (userID, score) =>{
	let user = GetUserDetails(userID)
	if(user === null){
		return false;
	}
	user.score += score;
	return true;

}

const GetScoreBoard = (roomID) => {
	let users = GetRoomPlayers(roomID)
	let scoreBoard = users.sort((a, b) => b.score - a.score);
	return scoreBoard
};

module.exports = {
	AddPlayer,
	UpdateRoomDetails,
	GetRoomPlayers,
	GetRoomID,
	GetUserDetails,
	GetRoomDetails,
	UpdateUserScore,
	GetScoreBoard,
	UserLeft
};
