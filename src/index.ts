import Component from "./framework/Component";
import { createVDom } from "./framework/vdom";

// Component를 렌더링 할 container를 생성
const rootDiv = document.createElement('div');
document.body.appendChild(rootDiv);

// 테스트 용 Component 정의
class ExampleComponent extends Component{
  getView(){
    const state = this.getState()
    return createVDom('h1', {}, `count: ${state.count || 0}`)
  }
}

// 컴포넌트 객체 셍성
const exampleComponent = new ExampleComponent(rootDiv);

// 컴포넌트 렌더링
exampleComponent.render();


// 컴포넌트의 state를 1초마다 변경
setInterval(()=> {
  exampleComponent.setState((prevState) => {
    console.log("prevState :", prevState)
    return {
      count: prevState.count ? ++prevState.count : 1
    }
  });
}, 1000);

// 컴포넌트의 state가 변경될 때 마다 다시 rendering 되면서 HTML 페이지에 변경사항이 반영된다.