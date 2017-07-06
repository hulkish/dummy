import React, { Component } from 'react';
import { Card } from 'antd';
import App3 from '../App3';
import App4 from '../App4';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Test App 2</h1>
        <Card>app 2 card</Card>
        <App3 />
        <App4 />
      </div>
    );
  }
}
export default App;
