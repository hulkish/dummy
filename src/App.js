import React, { Component } from 'react';
import { DatePicker } from 'antd';
// import 'antd/dist/antd.css';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div>
//         Test
//       </div>
//     );
//   }
// }
class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          <DatePicker />
        </p>
      </div>
    );
  }
}

export default App;
