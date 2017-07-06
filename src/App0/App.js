import React, { Component } from 'react';
import { DatePicker } from 'antd';
import App1 from '../App1'
import App2 from '../App2'
import App3 from '../App3'
import App4 from '../App4'
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Test App 0</h1>
        <DatePicker />
        <App1 />
        <App2 />
        <App3 />
        <App4 />
      </div>
    );
  }
}
export default App;
