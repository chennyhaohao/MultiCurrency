import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Auth } from '../../routes';
import '../../App.css';
import Navigation from '../Navigation/NavigationComponent';

class LoginComponent extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            redirectLogin: false,
        }

        this.onChange = this.onChange.bind(this);
        this.login = this.login.bind(this);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    login() {
        console.log(this.state);
        Auth.authenticate(this.state, () => {
            this.setState({ redirectLogin: Auth.isAuthenticated })
        });
    }

    render() {
        if (this.state.redirectLogin) {
            return <Redirect to="/" />;
        }
        return (
            <div className="loginForm">
                <Navigation />
                <h1>Login</h1>
                <label>Username</label>
                <input type="text" name="login" placeholder="Username" onChange={this.onChange} />
                <label>Password</label>
                <input type="password" name="password" placeholder="Password" onChange={this.onChange} />
                <input type="submit" value="Login" onClick={this.login} />
                <Link to="/register">Register</Link>
            </div>  
        );
    }
}

export default LoginComponent;