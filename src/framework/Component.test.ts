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

    (new TestComponent(rootDiv)).render();

    expect(rootDiv.textContent).toBe("Hello World")
  });

  it('render component nested element', () => {
    class TestComponent extends Component {
      getView(){
        return createVDom('ul', {}, [
          createVDom('li', {}, "item1"),
          createVDom('li', {}, "item2"),
          createVDom('li', {}, "item3")
        ])
      }
    }

    (new TestComponent(rootDiv)).render();

    expect(rootDiv.querySelectorAll('ul').length).toBe(1);
    expect(rootDiv.querySelectorAll('li').length).toBe(3);
  });

  it('rerender component when state is changed', () => {
    class TestComponent extends Component{
      getView(){
        const state = this.getState();
        return createVDom('div', {}, `count: ${state.count || 0}`);
      }
    }
    const testComponent = new TestComponent(rootDiv);
    testComponent.render();
    expect(rootDiv.querySelector('div')?.textContent).toBe("count: 0");

    testComponent.setState({count: 100});
    expect(rootDiv.querySelector('div')?.textContent).toBe("count: 100")

    testComponent.setState({count: 1000});
    expect(rootDiv.querySelector('div')?.textContent).toBe("count: 1000")
  })
})