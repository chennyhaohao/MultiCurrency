import React from 'react';
import { Auth } from '../../routes';
import Navigation from '../Navigation/NavigationComponent';

class HomeComponent extends React.Component {
    state = {
        wallet: '',
        userid: '',
        btcBalance: 0,
        ethBalance: 0,
        tokenBalance: 0,
        amount: 0,
        address: '',
        ethWallet: '',
        withdrawAddress: '',
        txid: '',
        msg: ''
    };

    constructor(props) {
        super(props);
        this.generateWallet = this.generateWallet.bind(this);
        this.inputHandler = this.inputHandler.bind(this);
        this.currencyBalance = this.currencyBalance.bind(this);
        this.tokenBalance = this.tokenBalance.bind(this);
        this.contributeSubmitHandler = this.contributeSubmitHandler.bind(this);
        this.withdrawSubmitHandler = this.withdrawSubmitHandler.bind(this);
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
        try {
            var res = await fetch('/tokensale/test');
            var result = await res.json();
            console.log(result);
        } catch (e) {
            console.log(e);
        }
    }

    generateWallet(currency) {
        fetch('/tokensale/generate-wallet/' + currency, {
            method: 'get',
            headers: Auth.headers(Auth.token),
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) this.setState({ address: res.address });
            });
    }

    getWallet(currency) {
        fetch('/tokensale/get-wallet/' + currency, {
            method: 'get',
            headers: Auth.headers(Auth.token),
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) this.setState({ address: res.address });
            });
    }

    currencyBalance(currency) {
        fetch('/tokensale/balance/' + currency, {
            method: 'get',
            headers: Auth.headers(Auth.token),
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) {
                    this.setState({ [currency+'Balance'] : res.balance });
                }
            }
        );
    }

    tokenBalance() {
        fetch('/tokensale/tokenbalance/' + this.state.ethWallet, {
            method: 'get',
            headers: Auth.headers(Auth.token),
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) {
                    this.setState({ tokenBalance: res.balance });
                }
            });
    }

    inputHandler(e) {
        var target = e.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({ [target.name]: value });
    }

    contributeSubmitHandler(e, currency) {
        e.preventDefault(); //Important! Control the form behavior!
        this.setState({ msg: "Transaction processing..." });
        fetch('/tokensale/contribute/' + currency, {
            method: 'post',
            headers: Auth.headers(Auth.token),
            body: JSON.stringify(this.state) //Important! Stringify the payload!
        }).then(res => res.json())
            .then(res => {
                console.log(res);
                this.setState({ msg: "" });

                if (res.error) {
                    console.log(res.error);
                } else {
                    this.currencyBalance(currency);
                    this.setState({ txid: res.txid });
                }
            });
    }

    withdrawSubmitHandler(e, currency) {
        e.preventDefault(); //Control the form behavior
        this.setState({ msg: "Transaction processing..." });
        fetch('/tokensale/withdraw/' + currency, {
            method: 'post',
            headers: Auth.headers(Auth.token),
            body: JSON.stringify(this.state) //Stringify the payload
        }).then(res => res.json())
            .then(res => {
                console.log(res);
                this.setState({ msg: "" });

                if (res.error) {
                    console.log(res.error);
                } else {
                    this.currencyBalance(currency);
                    this.setState({ txid: res.txid });
                }
            });
    }

    render() {
        return (
            <div className="HomeComponent">
                <Navigation/>
                <p>Wallet: {this.state.wallet}</p>
                <button onClick={this.test}>test</button> <br />
                <button onClick={() => {
                    this.generateWallet('btc');
                }} >generate btc wallet</button><br />
                <button onClick={() => {
                    this.generateWallet('eth');
                }} >generate eth wallet</button><br />
                <button onClick={() => {
                    this.getWallet('eth');
                }} >get eth wallet</button><br />
                Send to this address: <span>{this.state.address}</span>

                <form onSubmit={ (e)=> {
                    return this.contributeSubmitHandler(e, 'btc');
                }}>
                    User ID: <input
                    type='text'
                    name='userid'
                    onChange={this.inputHandler} /> <br />
                    Amount: <input
                    type='number'
                    name='amount'
                    step = '.00001'
                    onChange={this.inputHandler} /> <br />
                    Eth Wallet: <input
                    type='text'
                    name='ethWallet'
                    onChange={this.inputHandler} /> <br />
                    <input type="submit" value="contribute with btc" />
                </form> <br />

                 <form onSubmit={ (e)=> {
                    return this.contributeSubmitHandler(e, 'eth');
                }}>
                <input type="submit" value="contribute with eth" />
                </form> <br />

                <form onSubmit={ (e) => {
                    return this.withdrawSubmitHandler(e, 'btc');
                }}>
                    withdraw address: <input
                    type='text'
                    name='withdrawAddress'
                    onChange={this.inputHandler} /> <br />
                    <input type="submit" value="withdraw btc" />
                </form> <br />
                <form onSubmit={ (e) => {
                    this.withdrawSubmitHandler(e, 'eth');
                }}>
                    
                    <input type="submit" value="withdraw eth" />
                </form> <br />

                BTC Balance: <span>{this.state.btcBalance}</span> <br />
                ETH Balance: <span>{this.state.ethBalance}</span> <br />
                Token Balance: <span>{this.state.tokenBalance}</span> <br />
                <button onClick={()=> {
                    this.currencyBalance('btc');
                }}>check btc balance</button>
                <button onClick={()=> {
                    this.currencyBalance('eth');
                }}>check eth balance</button>
                <button onClick={this.tokenBalance}>check token balance</button><br />
                <span>Status: {this.state.msg}</span> <br />
                <span>Txid: {this.state.txid} </span>
            </div>
        );
    }
}

export default HomeComponent;