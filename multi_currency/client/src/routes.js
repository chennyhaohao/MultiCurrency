import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Home from './components/Home/HomeComponent';
import Login from './components/Login/LoginComponent';
import Logout from './components/Login/LogoutComponent';
import Register from './components/Register/RegisterComponent';
import ActivateAccount from './components/Register/ActivateComponent';
import Navigation from './components/Navigation/NavigationComponent';

const Auth = {
    m_isAuthenticated: false,
    token: null,
    user: {},

    headers(token = null) {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    },

    async isAuthenticated(cb = null) {
        if (!this.m_isAuthenticated) {
            this.token = localStorage.getItem('token');
            this.user = JSON.parse(localStorage.getItem('userData'));
            if (this.token != null) {
                await fetch('/users/auth', {
                    method: 'post',
                    headers: this.headers(this.token)
                }).then(res => {
                    this.m_isAuthenticated = (res.status === 200) ? true : false;
                });
            }
        }
        if (cb === null) {
            return this.m_isAuthenticated;
        } else {
            cb(this.m_isAuthenticated);
        }
    },

    authenticate(data, cb) {
        fetch('/users/login', {
            method: 'post',
            headers: this.headers(),
            body: JSON.stringify(data),
        }).then(res => res.json()).then(res => {
            if (res.data === null) {
                alert(res.error.msg);
                return;
            }
            this.token = res.data.token;
            this.user = res.data.user;
            if (data.rememberMe) {
                localStorage.setItem('token', this.token);
                localStorage.setItem('userData', JSON.stringify(this.user));
            }
            this.m_isAuthenticated = true;
            cb();
        });
    },

    signout(cb) {
        this.token = null;
        this.m_isAuthenticated = false;
        localStorage.removeItem('token');
        cb();
    }
};

const Authorization = (allowedRoles) => (WrappedComponent) => {
    return class WithAuthorization extends React.Component {
        constructor(props) {
            super(props)

            this.state = {
                isAuth: Auth.m_isAuthenticated,
                user: {
                    username: Auth.user.username,
                    role: Auth.user.role
                }
            }
        }

        render() {
            const { role } = this.state.user;
            const { isAuth } = this.state;

            console.log(isAuth);

            if (!isAuth) {
                return <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />
            }

            if (allowedRoles.includes(role)) {
                return <WrappedComponent {...this.props} />
            } else {
                return (
                    <div>
                        <Navigation />
                        <h1>No page for you!</h1>
                    </div>
                )
            }
        }
    }
}

const User = Authorization(['admin', 'user']);

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={User(Home)} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/register" component={Register} />
            <Route path="/activate/:key" component={ActivateAccount} />
        </Switch>
    </BrowserRouter>
);

export { Routes, Auth, Authorization };