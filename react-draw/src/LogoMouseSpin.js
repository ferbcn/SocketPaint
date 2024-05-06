import React, { useState } from 'react';
import reactLogo from "./media/logo.svg";

export default function LogoMouseSpin() {
    
    const [prevX, setPrevX] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [mouseDown, setMouseDown] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    function handleDrag (e, imgPos) {
        if (!mouseDown) {
            setPrevX(null);
            return;
        }
        if (prevX !== null) {
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
    }
    
    function handleMouseUp () {
        setMouseDown(false);
        setIsPlaying(true);
    }

    return (
        <div>
            <img className={"App-logo"} src={reactLogo} alt={"logo"}
                 style={{
                     transform: `rotate(${rotation}deg)`,
                     animation: isPlaying ? 'App-logo-spin infinite 20s linear' : 'none' // TODO: add velocity on button release
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

