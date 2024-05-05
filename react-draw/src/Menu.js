import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Import a CSS file to style your buttons

import reactLogo from './media/logo.svg';

export default function Menu() {
    const [prevX, setPrevX] = useState(null);
    const [rotation, setRotation] = useState(0);

    const handleDrag = (e) => {
        if (prevX !== null) {
            setRotation(rotation + (prevX) - e.clientX);
        }
        setPrevX(e.clientX);
    };

    return (
        <div className={"container-column"}>
            <div className="container-row">
                <img className={"App-logo"} src={reactLogo} alt={"logo"}
                     style={{transform: `rotate(${rotation}deg)`}}
                     draggable="true" 
                     onMouseMove={handleDrag} 
                     onDragStart={e => e.preventDefault()}/>
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