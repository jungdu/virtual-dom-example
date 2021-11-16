import { JSDOM } from "jsdom";

export function initJSDOM() {
	const { window } = new JSDOM(`<html>
    <body>
      <div id="root"></div>
    </body>
  </html>`);

	// @ts-expect-error
	global.window = window;
	global.document = window.document;

	return {
		rootDiv: document.getElementById("root") as HTMLDivElement,
	};
}
