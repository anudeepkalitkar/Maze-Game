import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { HashRouter } from "react-router-dom";
import App from "./components/App";
import M from "materialize-css";
ReactDOM.render(
	<React.StrictMode>
		{/* <BrowserRouter> */}
		<HashRouter>
			<App />
		</HashRouter>
		{/* </BrowserRouter> */}
	</React.StrictMode>,
	document.getElementById("root"),
	document.addEventListener("DOMContentLoaded", function () {
		M.Carousel.init(document.querySelectorAll(".carousel"), {
			fullWidth: true,
			indicators: true,
		});
		M.FormSelect.init(document.querySelectorAll("select"));
	})
);