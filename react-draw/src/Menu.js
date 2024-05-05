import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Import a CSS file to style your buttons

import reactLogo from './media/logo.svg';

export default function Menu() {
    return (         
            <div className={"container-column"}>
                <div className="container-row">
                    <img className={"App-logo"} src={reactLogo} alt={"logo"} />
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
