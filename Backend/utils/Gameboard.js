const gameBoard = {
	start: "0-0",
	target: "29-33",
	no_Rows: 30,
	no_Col: 34,
};

const GetRandomInt = (maxValue) => {
	return Math.floor(Math.random() * (maxValue + 1));
};

const GenerateVerticalMaze = (maxGaps) => {
	let startCol = GetRandomInt(1);
	let wall = [];
	let gaps = [];
	for (let c = startCol; c < gameBoard.no_Col; c += 2) {
		let no_Gaps = GetRandomInt(maxGaps);
		no_Gaps = no_Gaps ? no_Gaps : 1;
		for (let g = 0; g < no_Gaps; g++) {
			let r = GetRandomInt(gameBoard.no_Rows - 1);
			r = r ? r : 1;
			gaps.push(`${r}-${c}`);
		}
		for (let r = 0; r < gameBoard.no_Rows; r++) {
			if (
				!gaps.includes(`${r}-${c}`) &&
				`${r}-${c}` !== gameBoard.start &&
				`${r}-${c}` !== gameBoard.target
			) {
				wall.push(`${r}-${c}`);
			}
		}
	}

	return wall;
};

const GenerateHorizontalMaze = (maxGaps) => {
	let startRow = GetRandomInt(1);
	let wall = [];
	let gaps = [];
	for (let r = startRow; r < gameBoard.no_Rows; r += 2) {
		let no_Gaps = GetRandomInt(maxGaps);
		no_Gaps = no_Gaps ? no_Gaps : 1;
		for (let g = 0; g < no_Gaps; g++) {
			let c = GetRandomInt(gameBoard.no_Col - 1);
			gaps.push(`${r}-${c}`);
		}
		for (let c = 0; c < gameBoard.no_Col; c++) {
			if (
				!gaps.includes(`${r}-${c}`) &&
				`${r}-${c}` !== gameBoard.start &&
				`${r}-${c}` !== gameBoard.target
			) {
				wall.push(`${r}-${c}`);
			}
		}
	}
	return wall;
};

const GenerateRandomMaze = (no_Solutions, targetNode = [33, 29]) => {
	let solutions = [];
	while (solutions.length < no_Solutions) {
		let path = ["0-0"];
		let moveType,
			nextNode = [];
		while (true) {
			let presentNode = path.slice(-1)[0].split("-");
			presentNode = [parseInt(presentNode[0]), parseInt(presentNode[1])];
			moveType = [GetRandomInt(1), 1];
			presentNode[moveType[0]] += 1;
			nextNode = `${presentNode[0]}-${presentNode[1]}`;
			if (!path.includes(nextNode)) {
				path.push(nextNode);
			}
			if (presentNode[moveType[0]] === targetNode[moveType[0]]) {
				break;
			}
		}

		solutions.push(path);
	}
	let wall = [];
	for (const solution of solutions) {
		for (let row = 0; row < targetNode[0]; row++) {
			for (let col = 0; col < targetNode[1]; col++) {
				if (!solution.includes(`${row}-${col}`)) {
					if (!wall.includes(`${row}-${col}`)) {
						wall.push(`${row}-${col}`);
					}
				}
				else if(solution.includes(`${row}-${col}`) && wall.includes(`${row}-${col}`) ){
					const index = wall.indexOf(`${row}-${col}`);
					if (index > -1) { 
						wall.splice(index, 1); 
					}
				}
			}
		}
	}
	return wall;
};

const SolveMaze = (mazeMatrix_, startNode = [0, 0], targetNode = [29, 33]) => {
	const distances = {};
	const previousNodes = {};
	const queue = [];
	let mazeMatrix = [];
	for (let row = 0; row <= targetNode[0]; row++) {
		const currentRow = [];
		for (let col = 0; col <= targetNode[1]; col++) {
			if (mazeMatrix_.includes(`${row}-${col}`)) {
				currentRow.push(0);
			} else {
				currentRow.push(1);
			}
		}
		mazeMatrix.push(currentRow);
	}
	Object.keys(mazeMatrix).forEach((row) => {
		Object.keys(mazeMatrix[row]).forEach((col) => {
			const node = [Number(row), Number(col)];
			distances[node] = Infinity;
			previousNodes[node] = null;
			queue.push(node);
		});
	});
	distances[startNode] = 0;

	while (queue.length) {
		const current = queue.reduce((a, b) => (distances[a] < distances[b] ? a : b));

		if (current[0] === targetNode[0] && current[1] === targetNode[1]) {
			break;
		}
		queue.splice(queue.indexOf(current), 1);
		const neighboringNodes = GetNeighboringNodes(mazeMatrix, current);
		neighboringNodes.forEach((neighbor) => {
			const alt = distances[current] + 1;
			if (alt < distances[neighbor]) {
				distances[neighbor] = alt;
				previousNodes[neighbor] = current;
			}
		});
	}

	const path = [];
	let current = targetNode;
	while (current) {
		path.unshift(current);
		current = previousNodes[current];
	}

	const shortestPath = [];
	path.forEach((node) => {
		shortestPath.push(`${node[0]}-${node[1]}`);
	});
	return shortestPath;
};

const GetNeighboringNodes = (mazeMatrix, node) => {
	const [row, col] = node;
	const neighboringNodes = [];
	if (mazeMatrix[row - 1] && mazeMatrix[row - 1][col]) {
		neighboringNodes.push([row - 1, col]);
	}
	if (mazeMatrix[row + 1] && mazeMatrix[row + 1][col]) {
		neighboringNodes.push([row + 1, col]);
	}
	if (mazeMatrix[row][col - 1]) {
		neighboringNodes.push([row, col - 1]);
	}
	if (mazeMatrix[row][col + 1]) {
		neighboringNodes.push([row, col + 1]);
	}
	return neighboringNodes;
};

const CalcUserScore = (shortestPath, userPath) => {
	let score = 0;
	try {
		score =
			shortestPath.length > userPath.length
				? (userPath.length / shortestPath.length) * 100
				: (shortestPath.length / userPath.length) * 100;
	} catch {}
	score = score * 0.95;
	// console.log(score);
	return score;
};

module.exports = {
	GetRandomInt,
	GenerateHorizontalMaze,
	GenerateVerticalMaze,
	GenerateRandomMaze,
	SolveMaze,
	CalcUserScore,
};
