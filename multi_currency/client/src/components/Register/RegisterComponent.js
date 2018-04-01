import React from 'react';
import { Redirect } from 'react-router-dom';
import Navigation from '../Navigation/NavigationComponent';

class RegisterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            password2: '',
            redirectToLogin: false,
        }

        this.onChange = this.onChange.bind(this);
        this.register = this.register.bind(this);
    }

    register(e) {
        e.preventDefault();
        console.log(this.state);
        if (this.state.password === this.state.password2) {
            fetch('/users/register', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(this.state),
            }).then(res => res.json()).then(res => {
                if (res.status === true) {
                    alert(res.data);
                    this.setState({ redirectToLogin: true });
                } else if (res.status === false) {
                    alert(res.error.msg);
                }
            });
        } else {
            alert("Passwords aren't the same!");
        }
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        let { username, email } = this.state;
        let redirect = this.state.redirectToLogin ? <Redirect to="/login" /> : null;
        return (
            <div className="loginForm">
                <Navigation />
                {redirect}
                <form onSubmit={this.register}>
                    <h1>Create account</h1>
                    <label htmlFor="username">Username</label>
                    <input required type="text" name="username" id="username" placeholder="Username" onChange={this.onChange} value={username} />
                    <label htmlFor="email">E-mail</label>
                    <input required type="email" name="email" id="email" placeholder="E-mail" onChange={this.onChange} value={email} />
                    <label>Password</label>
                    <input required type="password" name="password" id="password" placeholder="Password" onChange={this.onChange} />
                    <input required type="password" name="password2" id="password2" placeholder="Retype password" onChange={this.onChange} />
                    <input type="submit" value="Create account" onClick={this.register} />
                </form>
            </div>
        );
    }
}

export default RegisterComponent;