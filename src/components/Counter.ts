import Component from "../framework/Component";
import { createVDom } from "../framework/vdom";

export default class Counter extends Component {
	constructor(parent: HTMLElement) {
		super(parent);

		setInterval(() => {
			this.setState((prevState) => ({
				count: prevState.count ? prevState.count + 1 : 1,
			}));
		}, 1000);
	}

	getView() {
		const state = this.getState();
		return createVDom("h1", {}, `${state.count || 0} 초 경과`);
	}
}
