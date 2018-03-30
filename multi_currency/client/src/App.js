import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Routes from './routes';

class App extends Component {
    render() {
        console.log('AppComponent');
        return (

            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>

                <Routes />

            </div>
            
        );
    }
}

export default App;
