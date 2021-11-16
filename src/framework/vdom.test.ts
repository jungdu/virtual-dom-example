import { initJSDOM } from "../utils/testUtils";
import { createHTMLElement, createVDom, setProp } from "./vdom";

describe("vdom", () => {
	it("create vdom object", () => {
		expect(createVDom("li")).toEqual({
			type: "li",
			props: {},
			children: [],
		});

		expect(createVDom("li", { className: "item" }, [])).toEqual({
			type: "li",
			props: { className: "item" },
			children: [],
		});

		expect(
			createVDom("ul", {}, [
				createVDom("li", {}, "first item"),
				createVDom("li", {}, "second item"),
			])
		).toEqual({
			type: "ul",
			props: {},
			children: [
				{
					type: "li",
					props: {},
					children: "first item",
				},
				{
					type: "li",
					props: {},
					children: "second item",
				},
			],
		});
	});

	describe("setProp function", () => {
		let rootDiv: HTMLDivElement;
		let div: HTMLDivElement;

		beforeEach(() => {
			const { rootDiv: newRootDiv } = initJSDOM();
			rootDiv = newRootDiv;
			div = document.createElement("div");
		});

		it("Set attribute to HTMLElement", () => {
			setProp(div, "height", 100);

			expect(div.getAttribute("height")).toBe("100");
			expect(div.getAttribute("height")).not.toBe(100);
		});

		it("Set className to HTMLElement", () => {
			setProp(div, "className", "test-class");
			expect(div.className).toContain("test-class");
		});

		it("Set onclick event handler to HTMLElement", (done) => {
			setProp(div, "onclick", function () {
				done();
			});

			div.dispatchEvent(new window.Event("click"));
		});

		it("change 이벤트 헨들러 적용", (done) => {
			const input = document.createElement("input");
			setProp(input, "onchange", function () {
				expect(input.value).toBe("123");
				done();
			});

			input.value = "123";
			input.dispatchEvent(new window.Event("change"));
		});
	});

	describe("createHTMLElement function", () => {
		let rootDiv: HTMLDivElement;

		beforeEach(() => {
			const { rootDiv: newRootDiv } = initJSDOM();
			rootDiv = newRootDiv;
		});

		it("create HTMLElement without child", () => {
			const elem = createHTMLElement(createVDom("div", {}, []));
			expect(elem).toBeTruthy();
			expect(elem.tagName).toBe("DIV");
		});

		it("create HTMLElement with child", () => {
			const elem = createHTMLElement(
				createVDom("ul", {}, [
					createVDom("li", { className: "list-item" }, "first item"),
					createVDom("li", { className: "list-item" }, "second item"),
				])
			);

			expect(elem).toBeTruthy();
			expect(elem.childNodes.length).toBe(2);
			expect(elem.querySelectorAll("li").length).toBe(2);
			expect(elem.querySelectorAll(".list-item").length).toBe(2);
		});
	});
});
