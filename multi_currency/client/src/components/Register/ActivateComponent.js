import React from 'react';
import { Redirect } from 'react-router-dom';
import { Auth } from '../../routes';

class ActivateComponent extends React.Component {
    constructor(props) {
        super(props); 
        this.state = {
            username: null,
            email: null,
            token: this.props.match.params.key,
            redirectToLogin: false
        }

        this.activate = this.activate.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    activate(e) {
        e.preventDefault();
        fetch('/users/activate/', {
            method: 'post',
            headers: Auth.headers(),
            body: JSON.stringify(this.state)
        }).then(res => res.json()).then(res => {
            if (!res.status) {
                alert(res.error.msg);
            } else {
                alert(res.data);
            }

            this.setState({ redirectToLogin: true });
        });
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        var redirect = this.state.redirectToLogin ? <Redirect to="/login" /> : null;

        return (
            <div className="loginForm">
                {redirect}
                <h1>Activate account</h1>

                <form onSubmit={this.activate} >
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" onChange={this.onChange} />
                    <label htmlFor="email">E-mail</label>
                    <input type="email" name="email" id="email" onChange={this.onChange} />
                    <input type="submit" value="Activate" onSubmit={this.activate} />
                </form>
            </div>
        );
    }
}

export default ActivateComponent;