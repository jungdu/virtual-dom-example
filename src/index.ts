import Counter from "./components/Counter";
import List from "./components/List";

// Component를 렌더링 할 container를 생성
const rootDiv = document.createElement('div');
document.body.appendChild(rootDiv);

// 컴포넌트 렌더링
// (new Counter(rootDiv)).render();
new List(rootDiv).render();