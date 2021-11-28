import { createHTMLElement, VDom } from "./vdom";

export default abstract class Component {
  abstract getView():VDom

  render(parent: HTMLElement){
    const view = this.getView();

    const elem = createHTMLElement(view);
    parent.appendChild(elem);
  }
}