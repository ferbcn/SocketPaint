import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Import a CSS file to style your buttons
import LogoMouseSpin from './LogoMouseSpin';
import { useState } from "react";

export default function Menu({buttonLink}) {
    const [link, setLink] = useState(buttonLink)
    
    return (
        <div className={"container-column"}>
            <div className="container-row">
                <LogoMouseSpin />
            </div>
            <div className="container-row">
                <div className="menu">
                    <Link to={`${buttonLink}`}>
                        <button className="menu-button">Draw</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}