import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from './components/Home/HomeComponent';
import Login from './components/Login/LoginComponent';

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
        </Switch>
    </BrowserRouter>
);

export default Routes;