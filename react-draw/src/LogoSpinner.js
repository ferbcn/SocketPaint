import React, { useState } from 'react';
import reactLogo from "./media/logo.svg";

import "./LogoSpinner.css";

export default function LogoSpinner() {
    
    const [prevX, setPrevX] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [mouseDown, setMouseDown] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [cssStyle, setCssStyle] = useState('App-logo-spin infinite 20s linear');
    const [velocity, setVelocity] = useState(5);
    
    function setRotationTimeInCssStyle() {
        const rotTime = 30 / velocity;
        setCssStyle(`App-logo-spin infinite ${rotTime}s linear`);
    }
    
    function handleDrag (e, imgPos) {
        if (!mouseDown) {
            setPrevX(null);
            return;
        }
        if (prevX !== null) {
            const velocity = prevX - e.clientX;
            setVelocity(velocity);
            console.log("Velocity: " + velocity + "px/s")
            if (e.clientY > imgPos.y){
                setRotation(rotation + prevX - e.clientX);
            }
            else {
                setRotation(rotation + e.clientX - prevX);
            }
        }
        setPrevX(e.clientX);
    };
    
    function handleMouseDown () {
        setMouseDown(true);
        setIsPlaying(false);
        setRotationTimeInCssStyle();
    }
    
    function handleMouseUp () {
        setMouseDown(false);
        setIsPlaying(true);
    }

    return (
        <div className={"container-row"}>
            <img className={"App-logo"} src={reactLogo} alt={"logo"}
                 style={{
                     transform: `rotate(${rotation}deg)`,
                     animation: isPlaying ? `${cssStyle}` : 'none'
                 }}
                 draggable="true"
                 onMouseMove={(e) => {
                     const position = e.target.getBoundingClientRect();
                     handleDrag(e, {
                         x: position.left + (position.left + position.right) / 2,
                         y: position.top + (position.top + position.bottom) / 2
                     });
                 }}
                 onDragStart={e => e.preventDefault()}
                 onMouseDown={() => handleMouseDown()}
                 onMouseUp={() => handleMouseUp()}
                 onMouseLeave={() => handleMouseUp()}
            />
        </div>
    )
}

