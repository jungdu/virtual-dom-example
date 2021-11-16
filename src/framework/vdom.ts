import { isEventName } from "../utils/dom";

type VDomProps = { [key: string]: any };
interface VDom {
	type: string;
	props: VDomProps;
	children: Array<VDom> | string;
}

export function createVDom(
	type: string,
	props: VDomProps = {},
	children: Array<VDom> | string = []
): VDom {
	return {
		type,
		props,
		children,
	};
}

export function createHTMLElement(
	vDom: VDom,
	parent?: HTMLElement
): HTMLElement {
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

export function setProps(elem: HTMLElement, props: VDomProps) {
	Object.keys(props).forEach((key) => {
		setProp(elem, key, props[key]);
	});
}

export function setProp(elem: HTMLElement, key: string, value: any): void {
	if (key === "className") {
		elem.className = value;
		return;
	} else if (isEventName(key)) {
		elem[key] = value;
	}

	elem.setAttribute(key, value);
}
