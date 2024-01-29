import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { hostingURL } from "../Creds";
const Lobby = (props) => {
	const { game, SetGame, socketio } = props;
	const [redirect, SetRedirection] = useState(false);
	const roomURL = hostingURL +"?" + game.roomID;
	const [lobbyPlayers, SetLobbyPlayers] = useState(null);
	const [updateType, SetLobbyUpdateType] = useState(null);
	if (updateType === null) {
		socketio.emit("GetPlayers");
		// console.log("Getting Players")
	}

	const HandleGameSettings = (event) => {
		SetLobbyUpdateType("NewGameSettings");
		if (event.target.name === "Rounds") {
			SetGame({ ...game, rounds: event.target.value });
		} else if (event.target.name === "SolvingTime") {
			SetGame({ ...game, solvingTime: event.target.value });
		} else {
			SetGame({ ...game, gamePlay: event.target.value });
		}
	};

	const StartGame = (event) => {
		event.preventDefault();
		SetRedirection(true);
		socketio.emit("GameStarted");
	};
	useEffect(() => {
		if (updateType === "NewGameSettings") {
			let rounds = game.rounds;
			let solvingTime = game.solvingTime;
			let gamePlay = game.gamePlay;
			socketio.emit("UpdateLobby", { rounds, solvingTime, gamePlay });
			// console.log(
			// 	"By Admin Game Setting has been changed to",
			// 	game.rounds,
			// 	game.solvingTime,
			// 	game.gamePlay
			// );
		}
		SetLobbyUpdateType("");
	}, [updateType, game, socketio]);

	useEffect(() => {
		const GameStarted = () => {
			SetRedirection(true);
		};
		const GetPlayers = (roomPlayers) => {
			SetGame({ ...game, players: roomPlayers });
			// SetPlayers(roomPlayers);
			SetLobbyPlayers(
				roomPlayers.map((player) => {
					return (
						<div key={player.userID} className="col s12 m3 center">
							<i className="material-icons medium">{player.userEmoji}</i>
							<p className="Crazy Gradient">
								<b>{player.username}</b>
							</p>
						</div>
					);
				})
			);
		};

		const GetNewGameSettings = (rounds, solvingTime, gamePlay) => {
			SetGame({ ...game, rounds: rounds, solvingTime: solvingTime, gamePlay: gamePlay });

			// SetRounds(parseInt(game,));
			// SetSolvingTime(updates[1]);
			// SetGamePlay(updates[2]);
			// console.log("Game Setting has been changed to", rounds, solvingTime, gamePlay);
		};

		socketio.on("Players", GetPlayers);
		socketio.on("UserLeft", GetPlayers);
		socketio.on("NewGameSettings", GetNewGameSettings);
		socketio.on("GameStarted", GameStarted);
		return () => {
			socketio.off("LobbyPlayers", GetPlayers);
			socketio.off("UserLeft", GetPlayers);
			socketio.off("NewGameSettings", GetNewGameSettings);
			socketio.off("GameStarted", GameStarted);
		};
	}, [socketio, SetGame]);

	return (
		<>
			{redirect && <Redirect to="/game" />}
			{!game.roomID && <Redirect to="/" />}
			<div className="container">
				<div className="row">
					<div className="col s12 m3"></div>
					<div className="col s12 m6 center">
						<h1 className="title-div">Maze Game</h1>
					</div>
					<div className="col s12 m3"></div>
				</div>
			</div>

			<div className="container row ">
				<div className="col s12 m6 center ">
					<h4>Settings</h4>
				</div>
				<div className="col s12 m6 center">
					<h4>Players</h4>
				</div>

				<div className="container col s12 m6">
					<form className="container" onSubmit={StartGame}>
						<b className="form-labels">Rounds:&nbsp;</b>
						<div className="input-field ">
							{game.isPlayerAdmin && (
								<input
									className="input-text center browser-default black-text"
									name="Rounds"
									type="number"
									required
									autoComplete="off"
									defaultValue={game.rounds}
									onChange={HandleGameSettings}
								/>
							)}
							{!game.isPlayerAdmin && (
								<input
									className="input-text center browser-default black-text"
									type="number"
									name="Rounds"
									disabled
									autoComplete="off"
									value={game.rounds}
								/>
							)}
						</div>

						<div className="input-field">
						<b className="form-labels">Solving time in seconds:&nbsp;</b>
							{game.isPlayerAdmin && (
								<select
									name="SolvingTime"
									className="input-text center browser-default black-text"
									defaultValue={game.solvingTime}
									onChange={HandleGameSettings}
									required>
									<option value="30">30</option>
									<option value="60">60</option>
									<option value="90">90</option>
									<option value="120">120</option>
								</select>
							)}
							{!game.isPlayerAdmin && (
								<select
									name="SolvingTime"
									className="input-text center browser-default black-text"
									disabled
									value={game.solvingTime}>
									<option value="30">30</option>
									<option value="60">60</option>
									<option value="90">90</option>
									<option value="120">120</option>
								</select>
							)}
						</div>
						<div className="input-field">
						<b className="form-labels">Game Play:&nbsp;</b>
							
							{game.isPlayerAdmin && (
								<select
									name="GamePlay"
									className="input-text center browser-default black-text"
									defaultValue={game.gamePlay}
									onChange={HandleGameSettings}
									required>
									<option value="0">Easy</option>
									<option value="1">Medium</option>
									<option value="2">Hard</option>
								</select>
							)}
							{!game.isPlayerAdmin && (
								<select name="GamePlay" className="input-text center browser-default black-text" disabled value={game.gamePlay}>
									<option value="0">Easy</option>
									<option value="1">Medium</option>
									<option value="2">Hard</option>
								</select>
							)}
						</div>
						<div className="input-field center">
							{game.isPlayerAdmin && (
								<button type="submit" className=" btn green darken-2 center">
									Start Game
								</button>
							)}
							{!game.isPlayerAdmin && (
								<button type="submit" disabled className=" btn green darken-2 center">
									Start Game
								</button>
							)}
						</div>
					</form>
				</div>
				<div className="col s12 m6">
					<div className="row center">{lobbyPlayers}</div>
				</div>
			</div>
			<div className="container  ">
				<a className=" " target="_blank" rel="noreferrer" href={roomURL}>
					<h4 className="container input-text black-text">
						Invite your friends by sharing this link: {roomURL}
					</h4>
				</a>
			</div>
		</>
	);
};
export default Lobby;
