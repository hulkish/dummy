import React, { Component } from 'react';
import { ToolTip } from 'antd';
import App4 from '../App4';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Test App 3</h1>
        <ToolTip>app 3 tooltip</ToolTip>
        <App4 />
      </div>
    );
  }
}
export default App;
