import { isEventName } from "../utils/htmlEvent";

type VDomProps = { [key: string]: any };

type VDomChildren = Array<VDom> | string;
interface VDomObject {
	type: string;
	props: VDomProps;
	children: VDomChildren;
}

type VDom = VDomObject | string;

interface CreateAction {
	type: "CREATE";
	newVDom: VDom;
}

interface RemoveAction {
	type: "REMOVE";
}

interface ReplaceAction {
	type: "REPLACE";
	newVDom: VDom;
}

interface SetPropAction {
	type: "SET_PROP";
	name: string;
	value: any;
}

interface RemovePropAction {
	type: "REMOVE_PROP";
	name: string;
}

type UpdatePropAction = SetPropAction | RemovePropAction;

export interface UpdateAction {
	type: "UPDATE";
	updatePropsActions: Array<UpdatePropAction>;
	childrenActions: Array<DiffAction | null>;
}

type DiffAction = CreateAction | RemoveAction | ReplaceAction | UpdateAction;

function isVDomObject(vDom: VDom): vDom is VDomObject {
	return typeof vDom !== "string";
}

// Virtual DOM을 생성하는 함수 (리엑트에서는 JSX가 이 역할을 한다.)
export function createVDom(
	type: string,
	props: VDomProps = {},
	children: Array<VDom> | string = []
): VDomObject {
	return {
		type,
		props,
		children: Array.isArray(children) ? children : [children],
	};
}

// 이전 Virtual Dom과 변경될 Virtual DOM을 비교하여 변경될 부분들을 찾는 함수
export function diff(
	newVDom: VDom | null,
	oldVDom: VDom | null
): DiffAction | null {
	if (!oldVDom && newVDom) {
		return { type: "CREATE", newVDom };
	}

	if (!newVDom) {
		return { type: "REMOVE" };
	}

	if (changed(newVDom, oldVDom)) {
		return { type: "REPLACE", newVDom };
	}

	if (
		oldVDom &&
		isVDomObject(oldVDom) &&
		isVDomObject(newVDom) &&
		newVDom.type
	) {
		return {
			type: "UPDATE",
			updatePropsActions: diffProps(newVDom, oldVDom),
			childrenActions: diffChildren(newVDom, oldVDom),
		};
	}

	return null;
}

export function diffChildren(
	newVDom: VDomObject,
	oldVDom: VDomObject
): Array<DiffAction | null> {
	const actions: Array<DiffAction | null> = [];
	const actionsLength = Math.max(
		newVDom.children.length,
		oldVDom.children.length
	);

	for (let i = 0; i < actionsLength; i++) {
		actions[i] = diff(newVDom.children[i], oldVDom.children[i]);
	}
	return actions;
}

export function diffProps(
	newVDom: VDomObject,
	oldVDom: VDomObject
): Array<UpdatePropAction> {
	const actions: Array<UpdatePropAction> = [];
	const props = Object.assign({}, newVDom.props, oldVDom.props);
	Object.keys(props).forEach((name) => {
		const newVal = newVDom.props[name];
		const oldVal = oldVDom.props[name];
		if (!newVal) {
			actions.push({ type: "REMOVE_PROP", name });
		} else if (!oldVal || newVal !== oldVal) {
			actions.push({ type: "SET_PROP", name, value: newVal });
		}
	});

	return actions;
}

// 이전 VDom 과 이후 VDom 에서 바뀐점을 HTMLElement 에 반영하는 함수
export function dispatch(
	parent: HTMLElement,
	action: DiffAction | null,
	index: number = 0
) {
	if (!action) {
		return;
	}

	const child = parent.childNodes[index] as HTMLElement;
	switch (action.type) {
		case "CREATE": {
			const newChild = createHTMLElement(action.newVDom);
			parent.appendChild(newChild);
			return;
		}
		case "REMOVE":
			parent.removeChild(child);
			return;
		case "REPLACE":
			const newChild = createHTMLElement(action.newVDom);
			parent.replaceChild(newChild, child);
			return;
		case "UPDATE":
			const { updatePropsActions, childrenActions } = action;
			dispatchProps(child, updatePropsActions);
			for (let i = childrenActions.length - 1; i >= 0; i--) {
				dispatch(child, childrenActions[i], i);
			}
			return;
	}
}

export function dispatchProps(elem: HTMLElement, actions: UpdatePropAction[]) {
	for (let i = 0; i < actions.length; i++) {
		const updatePropAction = actions[i];

		if (updatePropAction.type === "SET_PROP") {
			setProp(elem, updatePropAction.name, updatePropAction.value);
		}

		if (updatePropAction.type === "REMOVE_PROP") {
			removeProp(elem, updatePropAction.name);
		}
	}
}

export function changed(newVDom: VDom | string, oldVDom: VDom | string | null) {
	return (
		typeof newVDom !== typeof oldVDom ||
		(typeof newVDom === "string" && newVDom !== oldVDom) ||
		// @ts-expect-error
		newVDom.type !== oldVDom.type
	);
}

// Virtual DOM을 HTMLElement로 만드는 함수
export function createHTMLElement(
	vDom: VDom,
	parent?: HTMLElement
): HTMLElement | Text {
	if (typeof vDom === "string") {
		const textNode = document.createTextNode(vDom);
		if (parent) {
			parent.appendChild(textNode);
		}

		return textNode;
	}

	const { type, props, children } = vDom;
	const elem = document.createElement(type);
	setProps(elem, props);

	if (typeof children === "string") {
		elem.textContent = children;
	} else {
		children.forEach((child) => {
			createHTMLElement(child, elem);
		});
	}

	if (parent) {
		parent.appendChild(elem);
	}

	return elem;
}

// Virtual DOM의 props를 HTML의 props로 적용하는 함수
export function setProp(elem: HTMLElement, key: string, value: any): void {
	if (key === "className") {
		elem.className = value;
		return;
	} else if (isEventName(key)) {
		elem[key] = value;
	}

	elem.setAttribute(key, value);
}

export function setProps(elem: HTMLElement, props: VDomProps) {
	Object.keys(props).forEach((key) => {
		setProp(elem, key, props[key]);
	});
}

export function removeProp(elem: HTMLElement, key: string) {
	if (key === "className") {
		elem.removeAttribute("class");
		return;
	}

	if (isEventName(key)) {
		elem[key] = function () {};
		return;
	}

	elem.removeAttribute(key);
}
