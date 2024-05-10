import React, {useEffect, useState, useRef} from 'react';
import './PhysicsToolbar.css';

import Draggable from 'react-draggable';

function PhysicsToolbar({ gravity, elasticity, setGravity, setElasticity, timeOut, setTimeOut }) {

    return (
        <div>
            <Draggable>
                <div className={"phy-toolbar"}>
                    <div className={"range-container"} >
                        <input type={"range"} min={0.1} max={1.0} step={0.1} value={gravity}
                               onChange={e => setGravity(parseFloat(e.target.value))}/>
                        <div className="input-size">Gravity: {gravity}</div>
                    </div>
                    <div className={"range-container"}>
                        <input type={"range"} min={0.5} max={1.5} step={0.01} value={elasticity}
                               onChange={e => setElasticity(e.target.value)}/>
                        <div className="input-size">Elasticity: {elasticity}</div>
                    </div>
                    <div className={"range-container"}>
                            <input type={"range"} min={1} max={100} step={1} value={timeOut}
                                   onChange={e => setTimeOut(e.target.value)}/>
                            <div className="input-size">Delay: {timeOut}</div>
                        </div>
                    </div>
            </Draggable>
        </div>
);
}

export default PhysicsToolbar;