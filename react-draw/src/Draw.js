import {useEffect, useState, useRef} from 'react';
import './Draw.css';

import {registerOnMessageCallback, send } from "./websocket";

export default function Draw({ initColor="#EE1133" }) {
    const [canvasSize, setCanvasSize] = useState({x: null, y: null});
    const [coords, setCoords] = useState({x: 0, y: 0});
    const [mouseDown, setMouseDown] = useState(false);
    const [selectedColor, setSelectedColor] = useState(initColor);
    const [penSize, setPenSize] = useState(25);
    const [penType, setPenType] = useState("round");
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
        sendPixel()
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
            sendPixel()
        }
    };
    function sendPixel() {
        const msg = {
            x: coords.x,
            y: coords.y,
            color: selectedColor,
            size: penSize,
            type: penType
        }
        send(JSON.stringify(msg))
    }
    
    function onMessageReceived(msg) {
        msg = JSON.parse(msg);
        if (msg.hasOwnProperty('color')) {
            drawOnCanvas(msg.x, msg.y, msg.color, msg.size, msg.type);
        }
        else if (msg.hasOwnProperty('command') && (msg.command === 'clear')) {
            clearCanvas();
        }
    }

    registerOnMessageCallback(onMessageReceived.bind(this));
    
    function drawOnCanvas(x, y, color, size, type) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        if (type === 'eraser') {
            clearRound(ctx, x, y-55, size)
        }
        else if (type === 'round') {
            ctx.beginPath();
            ctx.arc(x, y-55, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        else if (type === 'square') {
            ctx.fillRect(x-size/2, y-penSize/2-55, size, size);
        }
    }

    function clearRound(ctx, x, y, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.clip();
        ctx.clearRect(x - radius - 1, y - radius - 1, radius * 2 + 2, radius * 2 + 2);
        ctx.restore();
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
    
    function saveCanvasToPng() {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function handleTouchStart(e) {
        const touch = e.touches[0];
        setCoords({
            x: touch.clientX,
            y: touch.clientY,
        });
    }
    
    function handleTouch(e) {
        const touch = e.touches[0];
        setCoords({
            x: touch.clientX,
            y: touch.clientY,
        });
        setMouseDown(true);
        sendPixel();
    }
    
    return (
        <div>
            <div className={"container-mouse"} 
                 onMouseMove={handleWindowMouseMove} 
                 onMouseDown={handleMouseDown} 
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseUp}
                 onTouchStart={e => handleTouchStart(e)}
                 onTouchEnd={handleMouseUp}
                 onTouchMove={e => handleTouch(e)}
            >
                <canvas ref={canvasRef} width={canvasSize.x} height={canvasSize.y} 
                        style={{width: '100%', height: '100%'}}/>
            </div>
            <div className={"container-row"}>
                <div className={"container-data"}>
                    <div className={"tool-button-container"}>
                        <input className={"tool-button"} type={"button"} value={"Clear"} onClick={() => {
                            handleClearCommand()
                        }}/>
                        <input className={"tool-button"} type={"button"} value={"Save"} onClick={() => {
                            saveCanvasToPng()
                        }}/>
                    </div>
                    <input type={"color"} value={selectedColor}
                           onChange={e => setSelectedColor(e.target.value)}/>
                    <select value={penType} onChange={e => {
                        setPenType(e.target.value);
                    }}>
                        <option value="round">Round</option>
                        <option value="square">Square</option>
                        <option value="eraser">Eraser</option>
                    </select>
                    <div>
                        <input type={"range"} min={1} max={50} value={penSize}
                               onChange={e => setPenSize(e.target.value)}/>
                        Size: {penSize}
                    </div>
                </div>
            </div>
            <div className={"uuid-field"}>
                Session ID: {uuid}
            </div>
        </div>
    );
}