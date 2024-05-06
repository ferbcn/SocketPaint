import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

import Draw from './Draw';
import Menu from "./Menu";

function App() {

    return (
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
                    <Route path="/draw" element={<Draw initColor={"#61dafb"} bgColor={"#EEEEEE"}/>} />
                    <Route path="/draw/:uuidParam" element={<Draw initColor={"#61dafb"} bgColor={"#EEEEEE"}/>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;