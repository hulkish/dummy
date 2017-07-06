import React, { Component } from 'react';
import { Button } from 'antd';
import App2 from '../App2'
import App3 from '../App3'
import App4 from '../App4'
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Test App 1</h1>
        <Button>app 1</Button>
        <App2 />
        <App3 />
        <App4 />
      </div>
    );
  }
}
export default App;
