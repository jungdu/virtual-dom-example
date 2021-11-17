import { initJSDOM } from "../utils/testUtils";
import {
	createHTMLElement,
	createVDom,
	diff,
	diffChildren,
	diffProps,
	setProp,
	UpdateAction,
} from "./vdom";

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
					children: ["first item"],
				},
				{
					type: "li",
					props: {},
					children: ["second item"],
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

		it("Create HTMLElement without child", () => {
			const elem = createHTMLElement(createVDom("div", {}, [])) as HTMLElement;
			expect(elem).toBeTruthy();
			expect(elem.tagName).toBe("DIV");
		});

		it("Create HTMLElement with child", () => {
			const elem = createHTMLElement(
				createVDom("ul", {}, [
					createVDom("li", { className: "list-item" }, "first item"),
					createVDom("li", { className: "list-item" }, "second item"),
				])
			) as HTMLElement;

			expect(elem).toBeTruthy();
			expect(elem.childNodes.length).toBe(2);
			expect(elem.querySelectorAll("li").length).toBe(2);
			expect(elem.querySelectorAll(".list-item").length).toBe(2);
		});

		it("Create string element", () => {
			const elem = createHTMLElement("Hello World");

			expect(elem.textContent).toBe("Hello World");
		});
	});

	describe("Find out differences between two VDom", () => {
		describe("diffProps function", () => {
			it("Get a changed property", () => {
				const actions = diffProps(
					createVDom("li", { className: "classA" }, []),
					createVDom("li", { className: "classB" }, [])
				);

				expect(actions).toEqual([
					{
						type: "SET_PROP",
						name: "className",
						value: "classA",
					},
				]);
			});

			it("Get a removed property", () => {
				const actions = diffProps(
					createVDom("div", {}, []),
					createVDom("div", { className: "classB" }, [])
				);

				expect(actions).toEqual([
					{
						type: "REMOVE_PROP",
						name: "className",
						value: "classB",
					},
				]);
			});

			it("Get a changed property and a removed property", () => {
				const actions = diffProps(
					createVDom("div", { className: "a" }),
					createVDom("div", { className: "b", height: 100 })
				);

				expect(actions).toEqual([
					{ type: "SET_PROP", name: "className", value: "a" },
					{ type: "REMOVE_PROP", name: "height", value: 100 },
				]);
			});
		});

		describe("diffChildren function", () => {
			it("Get actions to replace child text to other text", () => {
				const action = diffChildren(
					createVDom("p", {}, "Hello World"),
					createVDom("p", {}, "Bye World")
				);

				expect(action).toEqual([{ type: "REPLACE", newVDom: "Hello World" }]);
			});

			it("Get action to replace child text to span element", () => {
				const action = diffChildren(
					createVDom("p", {}, [createVDom("span", {}, [])]),
					createVDom("p", {}, "some text")
				);

				expect(action).toEqual([
					{ type: "REPLACE", newVDom: createVDom("span", {}, []) },
				]);
			});

			it("Get action to replace child span element to text", () => {
				const action = diffChildren(
					createVDom("p", {}, "some text"),
					createVDom("p", {}, [createVDom("span", {}, [])])
				);
				expect(action).toEqual([{ type: "REPLACE", newVDom: "some text" }]);
			});

			it("Get action to create nested children", () => {
				const action = diffChildren(
					createVDom("p", {}, [createVDom("span", {}, "hello world")]),
					createVDom("p", {}, [createVDom("span", {}, [])])
				);

				expect(action).toEqual([
					{
						type: "UPDATE",
						props: [],
						children: [
							{
								type: "CREATE",
							},
						],
					},
				]);
			});
		});

		describe("diff function", () => {
			it("Get action to create element", () => {
				const action = diff(createVDom("li", {}, []), undefined);

				expect(action).toBeTruthy();
				expect(action).toEqual({
					type: "CREATE",
				});
			});

			it("Get action to remove element", () => {
				const action = diff(undefined, createVDom("li", {}, []));

				expect(action).toBeTruthy();
				expect(action).toEqual({
					type: "REMOVE",
				});
			});

			it("Get action to replace element to element has another type", () => {
				const action = diff(
					createVDom("li", {}, []),
					createVDom("div", {}, [])
				);

				expect(action).toEqual({
					type: "REPLACE",
					newVDom: createVDom("li", {}, []),
				});
			});

			it("Get action to replace element to text", () => {
				const action = diff("Text node", createVDom("li", {}, []));

				expect(action).toEqual({ type: "REPLACE", newVDom: "Text node" });
			});

			it("Get action to replace text node to element", () => {
				const action = diff(createVDom("li", {}, []), "Text node");

				expect(action).toEqual({
					type: "REPLACE",
					newVDom: createVDom("li", {}, []),
				});
			});

			it("Get action to update props", () => {
				const action = diff(
					createVDom("div", { className: "a", height: 100 }, []),
					createVDom("div", { className: "b", width: 20 }, [])
				) as UpdateAction;

				expect(action).toBeTruthy();
				expect(action!.type).toEqual("UPDATE");
				expect(action.props.length).toBe(3);
				expect(action.props).toEqual(
					expect.arrayContaining([
						{
							type: "SET_PROP",
							name: "className",
							value: "a",
						},
						{
							type: "SET_PROP",
							name: "height",
							value: 100,
						},
						{
							type: "REMOVE_PROP",
							name: "width",
							value: 20,
						},
					])
				);
			});
		});
	});
});
