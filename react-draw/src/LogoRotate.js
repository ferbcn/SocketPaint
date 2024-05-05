//import LogoRotate from './LogoRotate';
import React, { useState } from 'react';
import reactLogo from "./media/logo.svg";

export default function LogoRotate() {
    
    const [prevX, setPrevX] = useState(null);
    const [rotation, setRotation] = useState(0);

    function handleDrag (e, imgPos) {
        console.log(e.clientY, imgPos.y);
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

    return (
        <div>
            <img className={"App-logo"} src={reactLogo} alt={"logo"}
                 style={{transform: `rotate(${rotation}deg)`}}
                 draggable="true"
                 onMouseMove={(e) => {
                     const position = e.target.getBoundingClientRect();
                     handleDrag(e, {
                         x: position.left + (position.left + position.right) / 2,
                         y: position.top + (position.top + position.bottom) / 2
                     });
                 }}
                 onDragStart={e => e.preventDefault()}/>
        </div>
    )
}

