import {React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import Draw from './Draw';
import Menu from "./Menu";
import LogoSpinner from "./LogoSpinner";

import './App.css';
import Physics from "./Physics";

function App() {
    const [uuid, setUuid] = useState(null);

    useEffect(() => {
        //document.documentElement.style.setProperty('--accentColor', '#FF2222');
    }, []);
    
    function getNewUuid() {
        // get uuid from /api/getuuid
        const host = process.env.NODE_ENV === 'production' ? window.location.host : 'localhost:8080';
        const protocol = window.location.protocol;
        fetch(`${protocol}//${host}/api/getuuid`)
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                setUuid(data.uuid);
                //console.log("uuid set to:", uuid);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }
    
    useEffect(() => {
        getNewUuid();
    }, []);

    
    return (
        <Router>
            <div>
                
                {/*<nav>*/}
                {/*    <ul>*/}
                {/*        <li>*/}
                {/*            <Link to="/">Start</Link>*/}
                {/*        </li>*/}
                {/*        <li>*/}
                {/*            {uuid ? <Link to={`/draw/${uuid}`}>Draw</Link> : null}*/}
                {/*        </li>*/}
                {/*        <li>*/}
                {/*            <Link to={"/physics"}>Physics</Link>*/}
                {/*        </li>*/}
                {/*    </ul>*/}
                {/*</nav>*/}
                
                <Routes>
                    <Route path="/" element={<Menu buttonLink={`/physics`}/>}/>
                    <Route path="/draw/:uuidParam" element={<Draw initColor={"#61dafb"} bgColor={"#EEEEEE"}/>}/>
                    <Route path="/physics" element={<Physics initColor={"#FF2222"} bgColor={"#EEEEEE"}/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;