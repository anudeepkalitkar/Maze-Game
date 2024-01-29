// Import necessary libraries and components
import React, { useState, useEffect } from "react"; // Import React, useState, and useEffect from "react" library
import { Redirect } from "react-router-dom"; // Import Redirect from "react-router-dom" library
import Maze from "../Maze/Maze"; // Import Maze component
import "./Game.css"; // Import Game CSS file

// Game component definition
const Game = (props) => {
	// Destructure props
	const { game, socketio } = props;
	// Define state variables
	const [newMsg, SetNewMsg] = useState();
	const [chat, SetChat] = useState([]);
	const [redirect, SetRedirection] = useState(false);
	const [startTimer, SetStartTimer] = useState(false);
	const [timer, ChangeTimer] = useState(game.solvingTime);
	const [round, SetRound] = useState(0);
	const [scoreBoard, SetScoreBoard] = useState([]);
	const [userScoreUpdated, SetUserScoreUpdated] = useState(true);
	const [pathShown, SetPathShown] = useState(true);
	// Sleep function to pause execution for a given time
	const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	
	// Function to handle sending messages in the chat
	const SendMsg = (event) => {
		// console.log(newMsg);
		event.preventDefault();
		
		let formatedMsg = (
			<div key={Date.now()} className="row">
				<div className="right OutgoingMSG">
					<span className="UserName">you: </span>
					<p>{newMsg}</p>
				</div>
			</div>
		);
		socketio.emit("NewChatMessage", {newMsg});
		SetChat(prevChat => [...prevChat, formatedMsg]);
		// console.log(chatMessages);

	};

	// Function to handle chat message input changes
	const HandleChatMsg = (event) => {
		SetNewMsg(event.target.value);
	};
	
	// useEffect hook to manage the game timer
	useEffect(() => {
		async function TimeLeft() {
			await Sleep(1000);
			if (startTimer) {
				if (timer - 1 === -1) {
					SetStartTimer(false);
				} else {
					ChangeTimer(timer - 1);
				}
			}
		}
		TimeLeft();
		if(round > game.rounds){
			SetRedirection(true);
			socketio.emit("GameFinished");

		}
		if (!startTimer && userScoreUpdated && pathShown) {
			SetRound(round + 1);
			ChangeTimer(game.solvingTime);
			// console.log("Set User Score Updated to false");
			SetUserScoreUpdated(false);
			// console.log("Set Path Shown to false");
			SetPathShown(false);
			// console.log("Starting the Timer of Rounds", round);
		}
	}, [timer, startTimer, round, userScoreUpdated, pathShown, game, socketio]);

	// useEffect hook to manage the score board
	useEffect(() => {
		const GetScoreBoard = (leaderBoard) => {
			SetScoreBoard(
				leaderBoard.map((player) => {
					return (
						<div key={player.userID} className="row">
							<div className="col s12 m3 center">
								<i className="material-icons small">{player.userEmoji}</i>
							</div>
							<p className="Crazy Gradient col s12 m6 center">
								<b>{player.username}</b>
							</p>
							<p className="Crazy Gradient col s12 m3 center">
								<b>{parseFloat(player.score.toFixed(2)) }</b>
							</p>
						</div>
					);
				})
			);

			// console.log(leaderBoard);
		};
		socketio.on("ScoreBoard", GetScoreBoard);

		const NewChatMessage = (newMsg) => {
			// console.log(newMsg);
			let formatedMsg = (
				<div key={Date.now()} className="row">
					<div className="left IncomingMSG">
						<span className="UserName">{newMsg[0]}: </span>
						<p>{newMsg[1]}</p>
					</div>
				</div>
			);
			SetChat(prevChat => [...prevChat, formatedMsg]);
			// console.log(chatMessages);
		};
		socketio.on("NewChatMessage", NewChatMessage);
		const GameFinished = () =>{
			SetRedirection(true);
		}
		socketio.on("GameFinished", GameFinished);


		return () => {
			socketio.off("ScoreBoard", GetScoreBoard);
			socketio.off("NewChatMessage", NewChatMessage);
			socketio.off("GameFinished", GameFinished);

		};
	}, [socketio]);

	// Render the game layout

	return (
		<>
			{redirect && <Redirect to="/winner" />}
			<div className="center">
				<div className="row">
					<div className="col s12 m3">
						<h1 className="title-div">R: {round}</h1>
					</div>
					<div className="col s12 m6">
						<h1 className="title-div">Maze Game</h1>
					</div>
					<div className="col s12 m3 ">
						<h1 className="title-div">{timer}</h1>
					</div>
				</div>
			</div>
			<div className=" row ">
				<div className="col s12 m3">
					<div className="ScoreBoard">
						<div className="row">
							<p className="col s12 m3 center">
								<b>Icon</b>
							</p>
							<p className="Crazy Gradient col s12 m6 center">
								<b>Username</b>
							</p>
							<p className="Crazy Gradient col s12 m3 center">
								<b>Score</b>
							</p>
						</div>
						{scoreBoard}
					</div>
				</div>
				<div className="col s12 m6">
					<table className="Maze">
						<tbody>
							<Maze
								isPlayerAdmin={game.isPlayerAdmin}
								startTimer={startTimer}
								SetStartTimer={SetStartTimer}
								socketio={socketio}
								round={round}
								userScoreUpdated={userScoreUpdated}
								SetUserScoreUpdated={SetUserScoreUpdated}
								pathShown={pathShown}
								SetPathShown={SetPathShown}></Maze>
						</tbody>
					</table>
				</div>
				<div className="col s12 m3">
					<div className="ChatWindow">
						<h4 className="title-div center black-text">Welcome to the Game</h4>
						<div className="ChatBox">{chat}</div>
						<div className="ChatInputBox">
							<form onSubmit={SendMsg}>
								<div className="input-field col s12 m10">
									<input
										className="input-text black-text"
										type="text"
										name="Message"
										autoComplete="off"
										onChange={HandleChatMsg}
									/>
									<label className="black-text">Enter Message</label>
								</div>
								<div className="input-field col s12 m2">
									<button type="submit" className="btn">
										<i className="material-icons">send</i>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
// Export the Game component as the default export
export default Game;
