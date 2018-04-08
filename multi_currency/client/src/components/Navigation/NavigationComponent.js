import React from 'react';
import { Link } from 'react-router-dom';
import { Auth } from '../../routes';

class NavigationComponent extends React.Component {
    render() {
        const loginLogoutButton = Auth.m_isAuthenticated ? <Link to="/logout">Logout</Link> : <Link to="/login">Login</Link>;

        return (
            <div>
                <Link to="/">Home</Link>
                {loginLogoutButton}
                <Link to="/register">Create account</Link>
            </div>
        );
    }
}

export default NavigationComponent;