import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {wallet: ''}

  constructor(props) {
      super(props);
      this.generateWallet = this.generateWallet.bind(this);
  }

  componentDidMount() {
    /*fetch('/tokensale')
      .then(res => res.json())
      .then(res=>this.setState({text: res.balance}));*/

    
  }

  increment() {
      fetch('/users');
  }

  async test() {
      try{ 
          var res = await fetch('/tokensale/test');
          var result = await res.json();
          console.log(result);
      } catch (e) {
          console.log(e);
      }
  }

  generateWallet() {
      fetch('/tokensale/generate-wallet/btc')
        .then(res => res.json())
        .then(res => {
            console.log(res);
            this.setState({wallet: res.wallet});
        });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
          <p>Wallet: {this.state.wallet}</p>
          <button onClick={this.test}>test</button> <br />
          <button onClick={this.generateWallet}>generate btc wallet</button>


        </p>
      </div>
    );
  }
}

export default App;
