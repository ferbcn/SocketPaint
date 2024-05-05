import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Import a CSS file to style your buttons
import LogoRotate from './LogoRotate';
import reactLogo from './media/logo.svg';

export default function Menu() {
    
    return (
        <div className={"container-column"}>
            <div className="container-row">
                <LogoRotate />
            </div>
            <div className="container-row">
                <div className="menu">
                    <Link to="/draw">
                        <button className="menu-button">Draw</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}