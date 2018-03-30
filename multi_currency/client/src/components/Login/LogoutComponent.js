import React from 'react';
import { Redirect } from 'react-router-dom';
import { Auth } from '../../routes';

class LogoutComponent extends React.Component {

    componentDidMount() {
        Auth.signout(() => { console.log("Logged out") });
    }

    render() {
        return <Redirect to="/login" />;
    }
}

export default LogoutComponent;