import {useEffect, useState, useRef} from 'react';
import './Draw.css';

import {registerOnMessageCallback, send, startWebsocketConnection} from "./websocket";
import { useParams } from 'react-router-dom'

import Toolbar from './Toolbar';

export default function Draw({ initColor="#EE1133" , bgColor="#FFFFFF"}) {
    const [canvasSize, setCanvasSize] = useState({x: null, y: null});
    const [coords, setCoords] = useState({x: 0, y: 0});
    const [mouseDown, setMouseDown] = useState(false);
    const [selectedColor, setSelectedColor] = useState(initColor);
    const [penSize, setPenSize] = useState(25);
    const [penType, setPenType] = useState("round");
    const canvasRef = useRef(null);
    const [fillColor, setFillColor] = useState(bgColor);

    const { uuidParam } = useParams()
    const [copySuccess, setCopySuccess] = useState('');


    useEffect(() => {

        // prevent scrolling on touch devices
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, {passive: false});

        startWebsocketConnection({endpoint: 'wschat', uuid: uuidParam});

        // handle window resize
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

    }, [uuidParam]); // Added uuidParam to the dependency array

    const handleMouseDown = event => {
        setMouseDown(true)
        sendPixel()
    };
    const handleMouseUp = event => {
        setMouseDown(false)
    };
    
    const handleMouseMove = event => {
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
            type: penType,
            uuid: uuidParam
        }
        send(JSON.stringify(msg))
    }
    
    function onMessageReceived(msg) {
        msg = JSON.parse(msg);
        // Basic drawing
        if (msg.hasOwnProperty('color') && msg.hasOwnProperty('size') && msg.hasOwnProperty('type')){
            drawOnCanvas(msg.x, msg.y, msg.color, msg.size, msg.type);
        }
        // Special commands
        else if (msg.hasOwnProperty('command')) {
            if (msg.command === 'clear') {
                clearCanvas();
            }
            else if (msg.command === 'fill') {
                drawFillColor(msg.color);
            }
        }
    }

    registerOnMessageCallback(onMessageReceived.bind(this));
    
    function drawOnCanvas(x, y, color, size, type) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: true});
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
    
    function clearCanvas() {
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

    function drawFillColor(color) {
        setFillColor(color);
        // fill the canvas with the new color
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // set drawing style to opaque
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function handleClearCommand() {
        const msg = {
            command: "clear"
        }
        send(JSON.stringify(msg))
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

    function handleSelectedFillColor(fillColor){
        const msg = {
            command: "fill",
            color: fillColor
        }
        send(JSON.stringify(msg))
    }

    function copyToClipboard() {
        // get host address from window.location
        const host = process.env.NODE_ENV === 'production' ? window.location.host : 'localhost:3000';
        const fullUrl = `${window.location.protocol}//${host}/draw/${uuidParam}`;
        navigator.clipboard.writeText(fullUrl)
            .then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(null), 2000); // remove the message after 2 seconds
            })
            .catch(err => {
                setCopySuccess('Failed to copy!');
            });
    }

    return (
        <div>
            <div className={"container-draw"}
                 onMouseMove={handleMouseMove} 
                 onMouseDown={handleMouseDown} 
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseUp}
                 onTouchStart={e => handleTouchStart(e)}
                 onTouchEnd={handleMouseUp}
                 onTouchMove={e => handleTouch(e)}>
                
                <canvas ref={canvasRef} width={canvasSize.x} height={canvasSize.y} style={{width: '100%', height: '100%'}}/>
                
            </div>
            
            <Toolbar
                handleClearCommand={handleClearCommand}
                saveCanvasToPng={saveCanvasToPng}
                fillColor={fillColor}
                handleSelectedFillColor={handleSelectedFillColor}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                penType={penType}
                setPenType={setPenType}
                penSize={penSize}
                setPenSize={setPenSize}
                copyToClipboard={copyToClipboard}
                copySuccess={copySuccess}
            />
        </div>
    );
}