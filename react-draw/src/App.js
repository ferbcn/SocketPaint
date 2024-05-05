import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

import Draw from './Draw';
import Menu from "./Menu";
import WebSocketManager from './WebSocketManager';

import { MouseContext } from './MouseContext';

function App() {
    const [mouseDown, setMouseDown] = useState(false);
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [initColor, setinitColor] = useState("#DD3333");

    return (
        <MouseContext.Provider value={{ mouseDown, setMouseDown }}>
            <Router>
                <div>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Menu</Link>
                            </li>
                            <li>
                                <Link to="/draw">Draw</Link>
                            </li>
                        </ul>
                    </nav>
    
                    <Routes>
                        <Route path="/" element={<Menu />} />
                        <Route path="/draw" element={
                            <WebSocketManager endpoint="wschat">
                                <Draw />
                            </WebSocketManager>
                        } />
                    </Routes>
                </div>
            </Router>
        </MouseContext.Provider>
    );
}

export default App;