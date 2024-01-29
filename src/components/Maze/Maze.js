import React, { useState, useEffect } from "react";
import Node from "../Node/Node";
import "./Maze.css";

const Maze = (props) => {
	const { isPlayerAdmin, startTimer, SetStartTimer, round, socketio, userScoreUpdated, SetUserScoreUpdated, pathShown, SetPathShown } = props;
	const [mouseIsPressed, SetMouseIsPressed] = useState(false);
	const [gameBoard, SetGameBoard] = useState({
		start: "0-0",
		target: "29-33",
		no_Rows: 30,
		no_Col: 34,
		walls: ["-"],
		nodes: [],
		userNodes: [],
		newWalls: false,
		newUserNodes: false,
	});
	
	const delay = async (milliseconds) => {
		await new Promise(resolve => {
			return setTimeout(resolve, milliseconds)
		});
	};
	const ChangeNodeStatus = (id = null, status) => {
		if (id) {
			const newNodes = gameBoard.nodes.map((rows, i) => {
				return rows.map((value, i) => {
					if (value.id === id) {
						// console.log(value);
						return { ...value, status: status };
					} else {
						return value;
					}
				});
			});
			SetGameBoard({
				...gameBoard,
				nodes: newNodes,
			});
		}
	};
	const GetUserNodes = () => {
		// console.log("Getting the User Nodes");
		let allNodes = [].concat(...gameBoard.nodes);
		let userNodes = allNodes.filter((value) => value.status === "userNode");
		let userNodes1 = userNodes.map((node) => {
			return node.id;
		});
		SetGameBoard({ ...gameBoard, userNodes: userNodes1, newUserNodes: true });
	};

	const GetBoard = () => {
		const grid = [];
		for (let row = 0; row < gameBoard.no_Rows; row++) {
			const currentRow = [];
			for (let col = 0; col < gameBoard.no_Col; col++) {
				currentRow.push(CreateNode(col, row));
			}
			grid.push(currentRow);
		}
		return grid;
	};

	const GenerateMaze = () => {
		if (isPlayerAdmin) {
			// console.log("Requesting for updated Scores");
			socketio.emit("GetScoreBoard");
			// console.log("Requesting to Generate Maze");
			socketio.emit("GenerateMaze", round);
		}
	};

	const ShowShortestPath = async (shortestPath) => {
		// console.log("Plotting the Shortest Path recived");
		for(const nodeId of shortestPath)
		{
			// ChangeNodeStatus(nodeId, "shortestPath");
			document.getElementById(nodeId).className = 'node-shortest-path';
			await delay(50);

		};
		await delay(10000);
		// alert("new round");
		// console.log("Set Path Shown to true");
		SetPathShown(true);
	};

	const GetUserScore = () => {
		// console.log("Requesting for User Score");
		let userPath = gameBoard.userNodes;
		socketio.emit("GetUserScore", { userPath });
	};

	const GetShortestPath = () => {
		// console.log("Requesting for Shortest Path");
		socketio.emit("GetShortestPath");
	};

	const CreateNode = (col, row) => {
		return {
			id: `${row}-${col}`,
			status:
				`${row}-${col}` === gameBoard.start
					? "Start"
					: `${row}-${col}` === gameBoard.target
					? "Traget"
					: gameBoard.walls.includes(`${row}-${col}`)
					? "wall"
					: "",
		};
	};

	useEffect(() => {
		if (gameBoard.nodes.length === 0) {
			SetGameBoard({ ...gameBoard, nodes: GetBoard() });
		}

		if (gameBoard.newWalls) {
			SetGameBoard({ ...gameBoard, newWalls: false, nodes: GetBoard() });
		}

		if (gameBoard.newUserNodes) {
			GetUserScore();
			SetGameBoard({ ...gameBoard, newUserNodes: false });
		}
	}, [gameBoard]);

	useEffect(() => {

			if (!startTimer && round === 0) {
				GenerateMaze();
			} else if (!startTimer&& !userScoreUpdated && !pathShown) {
				GetUserNodes();
				GetShortestPath();
			}
			if (!startTimer && userScoreUpdated && pathShown) {
				GenerateMaze();
				// console.log("Starting the Timer of Rounds", round);
				SetStartTimer(true);
			}
		
	}, [startTimer, userScoreUpdated, pathShown]);

	useEffect(() => {
		const NewMaze = (maze) => {
			// console.log("Recived new Maze");
			SetGameBoard({ ...gameBoard, walls: maze, newWalls: true });
		};
		socketio.on("NewMaze", NewMaze);
		const ShortestPath = (shortestPath) => {
			ShowShortestPath(shortestPath);
		};
		socketio.on("ShortestPath", ShortestPath);
		const UpdateUserScore = (score) => {
			// console.log("Recived the Updated Score");
			// console.log(score);
			// console.log("Set User Score Updated to true");
			SetUserScoreUpdated(true);
		};
		socketio.on("UserScore", UpdateUserScore);

		return () => {
			socketio.off("NewMaze", NewMaze);
			socketio.off("ShortestPath", ShortestPath);
			socketio.off("UserScore", UpdateUserScore);
		};
	}, [socketio]);

	return (
		<>
			{gameBoard.nodes.map((row, rowIdx) => {
				return (
					<tr key={rowIdx} id={rowIdx}>
						{row.map((node, nodeIdx) => {
							const { id, status } = node;
							return (
								<Node
									key={nodeIdx}
									id={id}
									status={status}
									mouseIsPressed={mouseIsPressed}
									SetMouseIsPressed={SetMouseIsPressed}
									ChangeNodeStatus={ChangeNodeStatus}
									row={row}></Node>
							);
						})}
					</tr>
				);
			})}
		</>
	);
};
export default Maze;
