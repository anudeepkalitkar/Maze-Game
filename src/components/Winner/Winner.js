import React, { useState, useEffect } from "react";
import DOMConfetti from "react-dom-confetti";
import Confetti from "react-confetti";
import "./Winner.css";
const Winner = (props) => {
	const { socketio } = props;
	const [scoreBoard, SetScoreBoard] = useState([]);
	const [celebrate, SetCelebrate] = useState(false);
	const [gameWinner, SetGameWinner] = useState();
	const celebrationConfig = {
		angle: 90,
		spread: 360,
		startVelocity: 20,
		elementCount: 70,
		dragFriction: 0.12,
		duration: 3000,
		stagger: 3,
		width: "10px",
		height: "10px",
		perspective: "500px",
		colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
	};
	socketio.emit("GetScoreBoard");
	useEffect(() => {
		const GetScoreBoard = (leaderBoard) => {
			SetGameWinner(leaderBoard[0]);
			SetScoreBoard(
				leaderBoard.map((player) => {
					return (
						<div key={player.userID} className="row center">
							<div className="col s12 m3 center">
								<i className="material-icons small">{player.userEmoji}</i>
							</div>
							<p className="Crazy Gradient col s12 m6 center">
								<b>{player.username}</b>
							</p>
							<p className="Crazy Gradient col s12 m3 center">
								<b>{player.score}</b>
							</p>
						</div>
					);
				})
			);
			SetCelebrate(true);
			// console.log(leaderBoard);
		};
		socketio.on("ScoreBoard", GetScoreBoard);
		return () => {
			socketio.off("ScoreBoard", GetScoreBoard);
		};
	}, [socketio]);

	return (
		<>
			<div className="row">
				<div className="col s12 m3"></div>

				<div className="col s12 m6">
					<div className="row">
                        <h1 className="title-div">Winner Winner Maze Solver</h1>
						<h1 className="col s12 m3 center">{gameWinner.userEmoji}</h1>
						<h1 className="Crazy Gradient col s12 m6 center">{gameWinner.username}</h1>
						<h1 className="Crazy Gradient col s12 m3 center">{gameWinner.score}</h1>
					</div>
					<div className="WinnerBoard">
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
				<div className="col s12 m3"></div>
			</div>
			{celebrate && <Confetti />}
			<DOMConfetti active={celebrate} config={celebrationConfig} />
		</>
	);
};

export default Winner;
