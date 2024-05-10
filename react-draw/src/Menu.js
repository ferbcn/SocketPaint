import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Import a CSS file to style your buttons
import LogoSpinner from './LogoSpinner';

export default function Menu({buttonLinks, buttonNames, uuid}) {
    
    return (
        <div className={"container-column-center"}>
            <div className="container-row">
                <LogoSpinner />
            </div>
            <div className="container-row">
                <div className="menu">
                    <Link to={`${buttonLinks[0]}`}>
                        <button className="menu-button">{buttonNames[0]}</button>
                    </Link>
                    <Link to={`${buttonLinks[1]}/${uuid}`}>
                        <button className="menu-button">{buttonNames[1]}</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}