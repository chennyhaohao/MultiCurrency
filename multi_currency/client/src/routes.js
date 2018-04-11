import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Home from './components/Home/HomeComponent';
import Login from './components/Login/LoginComponent';
import Logout from './components/Login/LogoutComponent';
import Register from './components/Register/RegisterComponent';
import ActivateAccount from './components/Register/ActivateComponent';

const Auth = {
    m_isAuthenticated: false,
    token: null,

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
            if (data.rememberMe) {
                localStorage.setItem('token', this.token);
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

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            Auth.m_isAuthenticated ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}
                />
            )
        }
    />
);

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <PrivateRoute exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/register" component={Register} />
            <Route path="/activate/:key" component={ActivateAccount} />
        </Switch>
    </BrowserRouter>
);

export { Routes, Auth };