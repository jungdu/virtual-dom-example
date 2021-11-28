import { initJSDOM } from "../utils/testUtils";
import Component from "./Component"
import { createVDom } from "./vdom"

describe('Component', () => {
  let rootDiv:HTMLDivElement;

  beforeEach(() => {
    const {rootDiv: newRootDiv} = initJSDOM();
    rootDiv = newRootDiv;
  })

  it('render component', () => {
    class TestComponent extends Component {
      getView(){
        return createVDom('h1', {}, "Hello World")
      }
    }

    (new TestComponent()).render(rootDiv);

    expect(rootDiv.textContent).toBe("Hello World")
  })
})