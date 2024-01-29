import "./Node.css";
const Node = (props) => {
	const { id, status, mouseIsPressed, SetMouseIsPressed, ChangeNodeStatus } = props;

	const handleMouseDown = (event) => {
		SetMouseIsPressed(true);
		let node = event.target;
		if(node.className!=="node wall" && node.className!=="node node-start" && node.className!=="node node-finish")
		{ChangetoUserVisited(node);}
	};

	const ChangetoUserVisited = (node) => {
		if (node.className.includes("userNode")) {
			node.className = node.className.split("userNode")[0];
			ChangeNodeStatus(node.id, "");
		} else {
			node.className += "userNode";
			ChangeNodeStatus(node.id, "userNode");
		}
	};
	const handleMouseUp = (event) => {
		event.preventDefault();
		SetMouseIsPressed(false);
	};

	const handleMouseOver = (event) => {
		if (mouseIsPressed) {
			let node = event.target;
			ChangetoUserVisited(node);
		}
	};

	const extraClassName =
		status === "Start"
			? "node-start"
			: status === "Traget"
			? "node-finish"
			: status === "wall"
			? "wall"
			// : status === "shortestPath"
			// ? "node-shortest-path"
			: "";
	if (status === "") {
		return (
			<td
				id={id}
				className={`node ${extraClassName}`}
				onMouseDown={handleMouseDown}
				onMouseOver={handleMouseOver}
				onMouseUp={handleMouseUp}></td>
		);
	}
	return (
		<td
			id={id}
			className={`node ${extraClassName}`}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}></td>
	);
};
export default Node;
