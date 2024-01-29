import { Redirect } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./Home.css";
import { getEmoji } from "../Hooks/getEmoji";
import M from "materialize-css";
import { isGitHubPages } from "../Creds";

const Home = (props) => {
	const { game, SetGame, socketio } = props;
	const [userEmoji, setUserEmoji] = useState();
	const [redirection, setRedirection] = useState(false);
	const [username, SetUsername] = useState("");
	const [userEmojiIndex, setUserEmojiIndex] = useState(Math.floor(Math.random() * 100));
	const [usernameError, setUsernameError] = useState("");
	const [flag, SetFlag] = useState(false);
	const [disclaimerDisplay, SetDisclaimerDisplay] = useState(isGitHubPages);
	useEffect(() => {
		let modal = document.querySelector(".modal");
		let modelInstance = M.Modal.init(modal, {});
		if (disclaimerDisplay) {
			modelInstance.open();
			SetDisclaimerDisplay(false);
		}
	}, []);
	const CheckUser = (username, roomID = "") => {
		if (roomID === "") {
			SetUsername(username);
			return false;
		}
		if (username.indexOf(" ") >= 0) {
			setUsernameError("error");
			alert("No spaces in Username!!!");
			return false;
		}

		SetUsername(username);
		setUsernameError("");
		return true;
	};

	const HandleInput = (event) => {
		CheckUser(event.target.value, game.roomID);
	};

	const handleEmoji = (event) => {
		if (event.target.id === "prevDp") {
			setUserEmojiIndex(userEmojiIndex - 1);
		} else if (event.target.id === "nextDp") {
			setUserEmojiIndex(userEmojiIndex + 1);
		} else {
			setUserEmojiIndex(Math.floor(Math.random() * 100));
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		let roomType;
		if (event.target.name === "joinRoom") {
			if (!game.roomID) {
				roomType = "public";
				socketio.emit("GetRoomID", { roomType });
			} else {
				let roomID = game.roomID;
				socketio.emit("AddPlayer", { username, userEmoji, roomID });
				setRedirection(true);
			}
		} else {
			roomType = "private";
			SetGame({ ...game, isPlayerAdmin: true });
			socketio.emit("GetRoomID", { roomType });
		}
	};

	useEffect(() => {
		const GetRoomID = (roomID) => {
			SetGame({ ...game, roomID: roomID });
			SetFlag(true);
		};
		const GetPrivateRoomID = (roomID) => {
			SetGame({ ...game, isPlayerAdmin: true, roomID: roomID });
			SetFlag(true);
		};
		socketio.on("roomID", GetRoomID);
		socketio.on("privateRoomID", GetPrivateRoomID);
		return () => {
			socketio.off("roomID", GetRoomID);
			socketio.off("privateRoomID", GetPrivateRoomID);
		};
	}, [socketio, SetUsername, SetGame, username, game]);

	useEffect(() => {
		if (flag) {
			let roomID = game.roomID;
			socketio.emit("AddPlayer", { username, userEmoji, roomID });
			setRedirection(true);
		}
	}, [flag, username, userEmoji, game, socketio]);

	useEffect(() => {
		setUserEmoji(getEmoji(userEmojiIndex));
	}, [userEmojiIndex, setUserEmoji]);

	return (
		<>
			{redirection && <Redirect to="/lobby" />}
			<div className="center">
				<div className="row">
					<div className="col s12 m3"></div>
					<div className="col s12 m6 center">
						<h1 className="title-div">MAZE GAME</h1>
					</div>
					<div className="col s12 m3 "></div>
				</div>
			</div>
			<div className="container box1">
				<form className="center">
					<div className="row">
						<div className="col s12 m4">
							<a className="waves-effect waves-light " onClick={handleEmoji}>
								<i id="prevDp" className="material-icons medium">
									chevron_left
								</i>
							</a>
						</div>
						<div className="col s12 m4">
							<i id="prevDp" className="material-icons medium">
								{userEmoji}
							</i>
						</div>
						<div className="col s12 m4">
							<a className="waves-effect waves-light" onClick={handleEmoji}>
								<i id="nextDp" className="material-icons medium">
									chevron_right
								</i>
							</a>
						</div>
					</div>
					<div className="row">
						<div className="col s12 m11">
							<b className="form-labels">Name:&nbsp;</b>
							<div className="input-field inline ">
								<input
									className="input-text center"
									type="text"
									name="username"
									required
									autoComplete="off"
									placeholder="Enter your Name"
									onChange={HandleInput}
								/>
							</div>
						</div>
						<div className="col s12 m1">
							<h2 className="material-icons large red-text">{usernameError}</h2>
						</div>
					</div>
					<div className="input-field">
						<button
							type="submit"
							name="joinRoom"
							className="waves-effect waves-light btn fill brown"
							onClick={handleSubmit}>
							Play
						</button>
					</div>
					<div className="input-field">
						<button
							type="submit"
							name="newRoom"
							className="waves-effect waves-light btn fill Green"
							onClick={handleSubmit}>
							Create a Private Room
						</button>
					</div>
				</form>
			</div>


			<div id="disclaimer" className="modal open ">
				<div className="modal-content ">
					<h4 className="title-div">
						GitHub pages does not allow Multiplayer game.<br></br> Sorry for the
						inconvince
					</h4>
					<button className="modal-close btn">close</button>
				</div>
			</div>
		</>
	);
};

export default Home;
