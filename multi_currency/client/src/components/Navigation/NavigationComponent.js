import React from 'react';
import { Link } from 'react-router-dom';
import { Auth } from '../../routes';

class NavigationComponent extends React.Component {
    render() {
        const loginRegisterButton = Auth.isAuthenticated ? <Link to="/logout">Logout</Link> : <Link to="/login">Login</Link>;

        return (
            <div>
                <Link to="/">Home</Link>
                { loginRegisterButton }
            </div>
        );
    }
}

export default NavigationComponent;