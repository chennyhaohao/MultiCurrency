import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Home from './components/Home/HomeComponent';
import Login from './components/Login/LoginComponent';
import Logout from './components/Login/LogoutComponent';
import Register from './components/Register/RegisterComponent';

const Auth = {
    isAuthenticated: false,
    username: null,
    token: null,

    authenticate(data, cb) {
        fetch('/users/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json()).then(res => {
            if (res.data === null) {
                alert(res.error.msg);
                return;
            }
            this.username = res.data.username;
            this.token = res.data.token;
            this.isAuthenticated = true;
            cb();
        });
    },
    signout(cb) {
        this.isAuthenticated = false;
        cb();
    }
};

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            Auth.isAuthenticated ? (
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
        </Switch>
    </BrowserRouter>
);

export { Routes, Auth };