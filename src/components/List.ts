import Component from "../framework/Component";
import { createVDom } from "../framework/vdom";

export default class List extends Component {
	constructor(parent: HTMLElement) {
		super(parent);

		this.state = {
			fruits: ["apple", "strawberry"],
		};
	}

	handleKeyUpForm = (e: KeyboardEvent) => {
		const currentTarget = e.currentTarget as HTMLInputElement;

		if (e.key === "Enter" && currentTarget.value) {
			this.setState((prevState) => ({
				fruits: [...prevState.fruits, currentTarget.value],
			}));
			currentTarget.value = "";
		}
	};

	getTitle() {
		return createVDom("h1", {}, "Fruits");
	}

	getList() {
		const state: {
			fruits: string[];
		} = this.getState();

		return createVDom(
			"ul",
			{},
			state.fruits.map((fruit) => createVDom("li", {}, fruit))
		);
	}

	getInput() {
		return createVDom("input", { onkeyup: this.handleKeyUpForm, type: "text" });
	}

	getView() {
		return createVDom("div", {}, [
			this.getTitle(),
			this.getList(),
			this.getInput(),
		]);
	}
}
