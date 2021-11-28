import Eventing from "./Eventing";
import { createHTMLElement, diff, dispatch, VDom } from "./vdom";

type State = {
  [key: string]: any
}

type SetStateCallback = (prevState: any) => any

const STATE_CHANGE_EVENT_NAME = "STATE_CHANGE";
export default abstract class Component {
  protected state: any = {};
  private eventing =  new Eventing();
  private prevView: VDom | null = null;

  constructor(private parent: HTMLElement){
    this.eventing.on(STATE_CHANGE_EVENT_NAME, () => {
      this.rerender()
    })
  }

  abstract getView():VDom;


  //// State 관련 함수

  setState(newState: State | SetStateCallback){
    if(typeof newState === "function"){
      this.state = newState(this.state);
    }else{
      this.state = newState;
    }

    this.eventing.trigger(STATE_CHANGE_EVENT_NAME)
  }

  getState(){
    return this.state;
  }


  //// Render 관련 함수

  private rerender(){
    if(!this.prevView){
      return new Error("Require prevView to rerender");
    }

    const view = this.getView();
    const diffAction = diff(view, this.prevView);
    dispatch(this.parent, diffAction);

    this.prevView = view;
  }

  private initRender(){
    const view = this.getView();
    const elem = createHTMLElement(view);
    this.parent.appendChild(elem);

    this.prevView = view;
  }

  render(){
    if(this.prevView){
      this.rerender();
    }else{
      this.initRender()
    }
  }
}