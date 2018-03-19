import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = { 
            wallet: '',
            userid: '',
            balance: 0,
            amount: 0
          };

  constructor(props) {
      super(props);
      this.generateWallet = this.generateWallet.bind(this);
      this.inputHandler = this.inputHandler.bind(this);
      this.userBalance = this.userBalance.bind(this);
      this.submitHander = this.submitHander.bind(this);
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

  userBalance() {
      fetch('/tokensale/balance/btc/' + this.state.userid)
      .then(res => res.json())
      .then(res => this.setState({balance: res.balance}));
  }

  inputHandler(e) {
      var target = e.target;
      var value = target.type === 'checkbox' ? target.checked : target.value;
      this.setState({[target.name]: value});
  }

  submitHander(e) {
      e.preventDefault(); //Important! Control the form behavior!
      fetch('/tokensale/contribute/btc', {
          method: 'post',
          headers: {'Content-Type':'application/json',
                    'Accept': 'application/json'},
          body: JSON.stringify(this.state) //Important! Stringify the payload!
      }).then(res => res.json())
      .then(res => console.log(res));
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
          <button onClick={this.generateWallet}>generate btc wallet</button><br />
          <form onSubmit={this.submitHander}>
            User ID: <input 
              type='text'
              name='userid'
              onChange={this.inputHandler} /> <br />
            Amount: <input 
              type='text'
              name='amount'
              onChange={this.inputHandler} /> <br />
              <input type="submit" value="submit" />
          </form>
          Balance: <span>{this.state.balance}</span> <br />
          <button onClick={this.userBalance}>check user balance</button>

        </p>
      </div>
    );
  }
}

export default App;
