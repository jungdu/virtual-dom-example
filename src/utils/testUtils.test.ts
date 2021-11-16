import { initJSDOM } from "./testUtils";

describe("testUtils", () => {
	let rootDiv: HTMLDivElement;
	beforeEach(() => {
		const { rootDiv: newRootDiv } = initJSDOM();
		rootDiv = newRootDiv;
	});

	it("Render a div in JSDOM", () => {
		expect(rootDiv).toBeTruthy();
		expect(rootDiv!.tagName).toBe("DIV");
	});

	it("Dispatch event in JSDOM", (done) => {
		rootDiv.onclick = (e) => {
			expect(e).toBeTruthy();
			done();
		};

		rootDiv.dispatchEvent(new window.Event("click"));
	});

	it("Dispatch change event to HTMLInputElement in JSDOM", (done) => {
		const input = document.createElement("input");
		input.onchange = function () {
			expect(input.value).toBe("changed value");
			done();
		};
		input.value = "changed value";
		input.dispatchEvent(new window.Event("change"));
	});
});
