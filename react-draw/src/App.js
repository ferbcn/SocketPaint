import {React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

import Draw from './Draw';
import Menu from "./Menu";

function App() {
    const [uuid, setUuid] = useState(null);
    
    function getUuid(){
        // get uuid from /api/getuuid
        const host = process.env.NODE_ENV === 'production' ? window.location.host : 'localhost:8080';
        const protocol = window.location.protocol;
        fetch(`${protocol}//${host}/api/getuuid`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setUuid(data.uuid);
                console.log("uuid set to:", uuid);
            });
    }
    
    useEffect(() => {
        getUuid();
    }, []);
    
    
    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            {uuid ? <Link to={`/draw/${uuid}`}>Draw</Link> : null}
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<Menu buttonLink={`/draw/${uuid}`}/>} />
                    <Route path="/draw" element={<Draw initColor={"#61dafb"} bgColor={"#EEEEEE"}/>} />
                    <Route path="/draw/:uuidParam" element={<Draw initColor={"#61dafb"} bgColor={"#EEEEEE"}/>} />
                </Routes>
                <div className="uuidFooter">
                    <p>Session ID: {uuid}</p>
                </div>
            </div>
        </Router>
    );
}

export default App;