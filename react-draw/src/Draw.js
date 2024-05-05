import {useEffect, useState, useRef} from 'react';
import './Draw.css';

import {registerOnMessageCallback, send } from "./websocket";

export default function Draw() {
    const [canvasSize, setCanvasSize] = useState({x: null, y: null});
    const [coords, setCoords] = useState({x: 0, y: 0});
    const [mouseDown, setMouseDown] = useState(false);
    const [selectedColor, setSelectedColor] = useState("#EE1133");
    const canvasRef = useRef(null);
    const [uuid, setUuid] = useState(null);
    
    useEffect(() => {
        
        // prevent scrolling on touch devices
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, {passive: false});
        
        // get uuid from /api/getuuid
        const host = process.env.NODE_ENV === 'production' ? window.location.host : 'localhost:8080';
        const protocol = window.location.protocol;
        fetch(`${protocol}//${host}/api/getuuid`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setUuid(data.uuid);
            });
        
        
        // function to handle window resize
        const handleResize = () => {
            setCanvasSize({
                x: window.innerWidth,
                y: window.innerHeight - 120
            });
        };

        // call handleResize immediately to set initial size
        handleResize();

        // set up event listener for window resize
        window.addEventListener('resize', handleResize);

        // clean up event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        
    }, []);

    const handleMouseDown = event => {
        setMouseDown(true)
        const msg = {
            x: coords.x,
            y: coords.y,
            color: selectedColor
        }
        sendPixel(msg)
    };
    const handleMouseUp = event => {
        setMouseDown(false)
    };
    
    const handleWindowMouseMove = event => {
        setCoords({
            x: event.clientX,
            y: event.clientY,
        });
        if (mouseDown) {
            const msg = {
                x: coords.x,
                y: coords.y,
                color: selectedColor
            }
            sendPixel(msg)
        }
    };
    function sendPixel(msg) {
        send(JSON.stringify(msg))
    }
    
    function onMessageReceived(msg) {
        msg = JSON.parse(msg);
        if (msg.hasOwnProperty('color')) {
            drawOnCanvas(msg.x, msg.y, msg.color);
        }
        else if (msg.hasOwnProperty('command') && (msg.command === 'clear')) {
            clearCanvas();
        }
    }

    registerOnMessageCallback(onMessageReceived.bind(this));
    
    function drawOnCanvas(x, y, color) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        //ctx.fillRect(x, y-60, 3, 3); // Draw a 5x5 square at the mouse position
        ctx.beginPath();
        ctx.arc(x, y-60, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    function handleClearCommand() {
        const msg = {
            command: "clear"
        }
        send(JSON.stringify(msg))
    }
    
    function clearCanvas() {
        // clear locally
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    return (
        <div>
            <div className={"container-mouse"} 
                 onMouseMove={handleWindowMouseMove} 
                 onMouseDown={handleMouseDown} 
                 onMouseUp={handleMouseUp}
                 onTouchStart={handleMouseDown}
                 onTouchEnd={handleMouseUp}
                 onTouchMove={handleWindowMouseMove}
            >
                <canvas ref={canvasRef} width={canvasSize.x} height={canvasSize.y} 
                        style={{width: '100%', height: '100%'}}/>
            </div>
            <div className={"container-row"}>
                <div className={"container-data"}>
                    <input className={"tool-button"} type={"button"} value={"Clear"} onClick={() => {
                        handleClearCommand()
                    }}/>
                    <input type={"color"} value={selectedColor} 
                           onChange={e => setSelectedColor(e.target.value)}/>
                    <div className={"mousePos"}>
                        Mouse positioned at:{' '}<b>({coords.x}, {coords.y})</b>
                    </div>
                    <div>
                        Mouse is Down:{' '}<b>{mouseDown ? 'Yes' : 'No'}</b>
                    </div>
                    <div>
                        Selected color:{' '}<b>{selectedColor}</b>
                    </div>
                </div>
            </div>
            <div className={"uuid-field"}>
                Session ID: {uuid}
            </div>
        </div>
    );
}