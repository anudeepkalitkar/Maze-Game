import React, { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import socketIOClient from "socket.io-client";
import "./Main.css";
import Home from "./Home/Home";
import Lobby from "./Lobby/Lobby";
import { useLocation } from "react-router-dom";
import Game from "./Game/Game";
import Winner from "./Winner/Winner";
import { backendURL } from "./Creds";

const socketio = socketIOClient(backendURL);

const App = () => {
	const location = useLocation();
	const [game, SetGame] = useState({
		username: "",
		userEmoji: "",
		players: [],
		isPlayerAdmin: false,
		roomID: location.search,
		rounds: 5,
		solvingTime: 30,
		gamePlay: 0,
	});

	useEffect(() => {
		SetGame({ ...game, roomID: game.roomID.split("?")[1] });
	}, []);

	return (
		<>
			<Route
				exact
				path="/"
				render={() => <Home game={game} SetGame={SetGame} socketio={socketio} />}
			/>
			<Route
				exact
				path="/lobby"
				render={() => <Lobby game={game} SetGame={SetGame} socketio={socketio} />}
			/>
			<Route
				exact
				path="/game"
				render={() => <Game game={game} SetGame={SetGame} socketio={socketio} />}
			/>
			<Route exact path="/winner" render={() => <Winner socketio={socketio} />} />
		</>
	);
};

export default App;
