import { Component,type ReactNode } from 'react';
export default class ToolBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<section className="atlas-panel" role="alert"><h2>This workspace could not finish loading.</h2><p>Your saved research has not been deleted. Retry the tool, or return to the Atlas.</p><button className="btn primary" onClick={()=>this.setState({failed:false})}>Retry workspace</button><a className="btn ghost" href="/atlas">Return to Atlas</a></section>:this.props.children;}
}
