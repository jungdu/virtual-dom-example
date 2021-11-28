import { initJSDOM } from "../utils/testUtils";
import {
	createHTMLElement,
	createVDom,
	diff,
	diffChildren,
	diffProps,
	dispatch,
	removeProp,
	setProp,
	UpdateAction,
} from "./vdom";

describe("vdom", () => {
	it("Create vdom object", () => {
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
		let div: HTMLDivElement;

		beforeEach(() => {
			const { rootDiv: newRootDiv } = initJSDOM();
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

	describe("removeProp function", () => {
		it("Remove class name", () => {
			const div = document.createElement("div");
			div.className = "dummy";
			expect(div.className).toBe("dummy");
			removeProp(div, "className");
			expect(div.className).toBeFalsy();
		});

		it("Remove width attribute", () => {
			const div = document.createElement("div");
			div.setAttribute("width", "100");
			expect(div.getAttribute("width")).toBe("100");
			removeProp(div, "width");
			expect(div.getAttribute("width")).toBeFalsy();
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

		it("Create HTMLElement with text child", () => {
			const elem = createHTMLElement(createVDom("h1", {}, "title"));

			expect(elem.textContent).toBe("title");
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

		it("Fire click event on created element", (done) => {
			const elem = createHTMLElement(
				createVDom("button", {
					onclick: () => {
						done();
					},
				}),
				rootDiv
			);

			elem.dispatchEvent(new window.Event("click"));
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
					{ type: "REMOVE_PROP", name: "height" },
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
						updatePropsActions: [],
						childrenActions: [
							{
								type: "CREATE",
								newVDom: "hello world",
							},
						],
					},
				]);
			});
		});

		describe("diff function", () => {
			it("Get action to create element", () => {
				const newVDom = createVDom("li", {}, []);
				const action = diff(newVDom, null);

				expect(action).toBeTruthy();
				expect(action).toEqual({
					type: "CREATE",
					newVDom,
				});
			});

			it("Get action to remove element", () => {
				const action = diff(null, createVDom("li", {}, []));

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
				expect(action.updatePropsActions.length).toBe(3);
				expect(action.updatePropsActions).toEqual(
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
						},
					])
				);
			});
		});
	});

	describe("dispatch function", () => {
		let rootDiv: HTMLElement;

		beforeEach(() => {
			const { rootDiv: newRootDiv } = initJSDOM();
			rootDiv = newRootDiv;
		});

		it("Create child by action", () => {
			dispatch(rootDiv, {
				type: "CREATE",
				newVDom: createVDom("h1", {}, "title"),
			});

			expect(rootDiv.querySelector("h1")).toBeTruthy();
			expect(rootDiv.textContent).toBe("title");
		});

		it("Remove child by action", () => {
			createHTMLElement(createVDom("h1", {}, "title"), rootDiv);
			expect(rootDiv.querySelector("h1")).toBeTruthy();

			dispatch(rootDiv, { type: "REMOVE" });

			expect(rootDiv.querySelector("h1")).toBeNull();
		});

		it("Replace child by action", () => {
			createHTMLElement(createVDom("button", {}, ""), rootDiv);
			expect(rootDiv.querySelector("button")).toBeTruthy();

			dispatch(rootDiv, { type: "REPLACE", newVDom: createVDom("input") });

			expect(rootDiv.querySelector("button")).toBeNull();
			expect(rootDiv.querySelector("input")).toBeTruthy();
		});

		it("Update child props by action", () => {
			createHTMLElement(
				createVDom("button", { width: 100, height: 300 }, ""),
				rootDiv
			);

			dispatch(
				rootDiv,
				{
					type: "UPDATE",
					childrenActions: [],
					updatePropsActions: [
						{
							type: "SET_PROP",
							name: "width",
							value: 500,
						},
						{
							type: "REMOVE_PROP",
							name: "height",
						},
					],
				},
				0
			);

			const buttonElem = rootDiv.querySelector("button") as HTMLButtonElement;
			expect(buttonElem).toBeTruthy();
			expect(buttonElem.getAttribute("width")).toBe("500");
			expect(buttonElem.getAttribute("height")).toBeNull();
		});

		it("Update child of child to remove an item by action", () => {
			createHTMLElement(
				createVDom("ul", {}, [
					createVDom("li", {}, "item1"),
					createVDom("li", {}, "item2"),
					createVDom("li", {}, "item3"),
				]),
				rootDiv
			);
			expect(rootDiv.querySelectorAll("li").length).toBe(3);

			dispatch(rootDiv, {
				type: "UPDATE",
				childrenActions: [null, null, { type: "REMOVE" }],
				updatePropsActions: [],
			});

			const liElems = Array.from(rootDiv.querySelectorAll("li")).map(
				(elem) => elem.textContent
			);
			expect(liElems.length).toBe(2);
			expect(liElems).toContain("item1");
			expect(liElems).toContain("item2");
			expect(liElems).not.toContain("item3");
		});

		it("Update child of child to append an item by action", () => {
			createHTMLElement(
				createVDom("ul", {}, [
					createVDom("li", {}, "item1"),
					createVDom("li", {}, "item2"),
					createVDom("li", {}, "item3"),
				]),
				rootDiv
			);
			expect(rootDiv.querySelectorAll("li").length).toBe(3);

			dispatch(rootDiv, {
				type: "UPDATE",
				childrenActions: [
					null,
					null,
					null,
					{
						type: "CREATE",
						newVDom: createVDom("li", {}, "item4"),
					},
				],
				updatePropsActions: [],
			});

			const liElems = Array.from(rootDiv.querySelectorAll("li")).map(
				(elem) => elem.textContent
			);
			expect(liElems.length).toBe(4);
			expect(liElems).toContain("item1");
			expect(liElems).toContain("item2");
			expect(liElems).toContain("item3");
			expect(liElems).toContain("item4");
		});

		it("Update child of child to replace an item by action", () => {
			createHTMLElement(
				createVDom("ul", {}, [
					createVDom("li", {}, "item1"),
					createVDom("li", {}, "item2"),
					createVDom("li", {}, "item3"),
				]),
				rootDiv
			);
			expect(rootDiv.querySelectorAll("li").length).toBe(3);

			dispatch(rootDiv, {
				type: "UPDATE",
				childrenActions: [
					null,
					null,
					{
						type: "REPLACE",
						newVDom: createVDom("div", {}, "item3"),
					},
				],
				updatePropsActions: [],
			});

			const liElems = Array.from(rootDiv.querySelectorAll("li")).map(
				(elem) => elem.textContent
			);
			const pElem = rootDiv.querySelector("div") as HTMLDivElement;
			expect(liElems.length).toBe(2);
			expect(liElems).toContain("item1");
			expect(liElems).toContain("item2");
			expect(pElem).toBeTruthy();
			expect(pElem.textContent).toBe("item3");
		});
	});
});
