import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Import a CSS file to style your buttons
import LogoSpinner from './LogoSpinner';
import Footer from "./Footer";

export default function Menu({buttonLink, uuid, getNewUuid}) {
    
    return (
        <div className={"container-column"}>
            <div className="container-row">
                <LogoSpinner />
            </div>
            <div className="container-row">
                <div className="menu">
                    <Link to={`${buttonLink}`}>
                        <button className="menu-button">Draw</button>
                    </Link>
                </div>
            </div>
            <Footer uuid={uuid} getNewUuid={getNewUuid}/>
        </div>
    );
}