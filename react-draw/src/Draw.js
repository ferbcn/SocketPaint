import React, {useEffect, useState, useRef} from 'react';
import './Draw.css';

import {registerOnMessageCallback, send, startWebsocketConnection} from "./websocket";
import { useParams } from 'react-router-dom'

import DrawMenuToolbar from "./DrawMenuToolbar";
import TextCursor from "./TextCursor";
import DrawToolbar from "./DrawToolbar";

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
    const [roundTripTime, setRoundTripTime] = useState(0);
    
    const SCREEN_CORR_FACTOR = 0;
    const [points, setPoints] = useState([]);
    const [startPoint, setStartPoint] = useState({x: 0, y: 0});
    
    const [textCursorActive, setTextCursorActive] = useState(false);
    const [textContent, setTextContent] = useState('');
    
    useEffect(() => {
        
        function handleTextInput(e) {
            // handle textInput
            console.log("Key pressed: ", e.key);
            if (e.key === 'Escape') {
                setTextCursorActive(false);
            }
            else {
                const msg = {
                    xStart: startPoint.x,
                    yStart: startPoint.y,
                    x: coords.x,
                    y: coords.y,
                    color: selectedColor,
                    size: penSize,
                    type: penType,
                    uuid: uuidParam,
                    text: e.key
                }
                send(JSON.stringify(msg))
            }
        }
        
        if (textCursorActive) {
            // set up event listener for window resize
            window.addEventListener('keydown', handleTextInput);
        }
        else {
            window.removeEventListener('keydown', handleTextInput);
        }

        // prevent scrolling on touch devices
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, {passive: false});

        startWebsocketConnection({endpoint: 'wschat', uuid: uuidParam});
        
        // handle window resize
        const handleResize = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Save current image data
            const imageData = canvas.toDataURL();

            // Resize the canvas
            setCanvasSize({
                x: window.innerWidth,
                y: window.innerHeight
            });

            // Create a new image and set its source to the saved image data
            const img = new Image();
            img.src = imageData;

            // When the image loads, draw it on the resized canvas
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
        };

        // call handleResize immediately to set initial size
        handleResize();

        // set up event listener for window resize
        window.addEventListener('resize', handleResize);

        // Start the interval
        const rttInterval = setInterval(sendRTTCommand, 10000); // 10000 milliseconds = 10 seconds

        // clean up event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(rttInterval);
        };

    }, [uuidParam, textCursorActive, textContent]); // Added uuidParam to the dependency array
    
    const handleMouseDown = event => {
        setMouseDown(true)
        if (penType === 'line' || penType === 'rectangle' || penType === 'fill-rect') {
            setStartPoint({
                x: event.clientX,
                y: event.clientY,
            });
        }
        else{
            sendPixel()
        }
    };
    const handleMouseUp = event => {
        if (mouseDown) {
            if (penType === 'line' || penType === 'rectangle' || penType === 'fill-rect') {
                sendPixel()
            }
        }
        setMouseDown(false)
    };
    
    const handleMouseMove = event => {
        setCoords({
            x: event.clientX,
            y: event.clientY,
        });
        if (penType === 'line' || penType === 'rectangle' || penType === 'fill-rect') {
            return;
        }
        if (mouseDown) {
            sendPixel()
        }
    };
        
    function sendPixel() {
        const msg = {
            xStart: startPoint.x,
            yStart: startPoint.y,
            x: coords.x,
            y: coords.y,
            color: selectedColor,
            size: penSize,
            type: penType,
            uuid: uuidParam,
        }
        send(JSON.stringify(msg))
    }
    
    function sendRTTCommand() {
        const msg = {
            command: "rtt",
            time: Date.now()
        }
        send(JSON.stringify(msg))
    }
    
    function onMessageReceived(msg) {
        msg = JSON.parse(msg);
        // Basic drawing
        if (msg.hasOwnProperty('text')) {
            setTextContent(textContent + msg.text);
        }
        if (msg.hasOwnProperty('type') && msg.type === 'text') {
            setTextCursorActive(true);
        }
        // Special commands
        else if (msg.hasOwnProperty('command')) {
            if (msg.command === 'clear') {
                clearCanvas();
            }
            if (msg.command === 'rtt') {
                let rtt = Date.now() - msg.time;
                setRoundTripTime(rtt);
            } else if (msg.command === 'fill') {
                drawFillColor(msg.color);
            } else if (msg.command === 'back') {
                oneStepBack();
            }
        }
        else {
            drawOnCanvas(msg.x, msg.y, msg.color, msg.size, msg.type, msg.xStart, msg.yStart);
            setPoints(prevPoints => [...prevPoints, {
                x: msg.x, y: msg.y, color: msg.color, size: msg.size, type: msg.type, 
                xStart: msg.xStart, yStart: msg.yStart}])
        }
    }

    registerOnMessageCallback(onMessageReceived.bind(this));
    
    function drawOnCanvas(x, y, color, size, type, xStart, yStart) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: true});
        ctx.fillStyle = color;
        if (type === 'eraser') {
            clearRound(ctx, x, y-SCREEN_CORR_FACTOR, size)
        }
        else if (type === 'round') {
            ctx.beginPath();
            ctx.arc(x, y-SCREEN_CORR_FACTOR, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        else if (type === 'square') {
            ctx.fillRect(x-size/2, y-penSize/2-SCREEN_CORR_FACTOR, size, size);
        }
        else if (type === 'spray') {
            drawRoundSprayOnCanvas(ctx, x, y, color, size);
        }
        else if (type === 'line') {
            ctx.beginPath();
            ctx.moveTo(xStart, yStart-SCREEN_CORR_FACTOR);
            ctx.lineTo(x, y-SCREEN_CORR_FACTOR);
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.stroke();
        }
        else if (type === 'rectangle') {
            const xDist = Math.abs(x - xStart)
            const yDist = Math.abs(y - yStart)
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            if (xStart < x && yStart < y) {
                ctx.rect(xStart, yStart - SCREEN_CORR_FACTOR, xDist, yDist);
                ctx.stroke();
            }
        }
        else if (type === 'fill-rect') {
            const xDist = Math.abs(x - xStart)
            const yDist = Math.abs(y - yStart)
            if (xStart < x && yStart < y) {
                ctx.fillRect(xStart, yStart - SCREEN_CORR_FACTOR, xDist, yDist);
            }
        }
    }
    
    function drawRoundSprayOnCanvas(ctx, x, y, color, size) {
        ctx.save(); // Save the current state
        ctx.beginPath();
        ctx.arc(x, y-SCREEN_CORR_FACTOR, size, 0, 2 * Math.PI);
        ctx.clip(); // Create a clipping region

        for (let i = 0; i < size; i++) {
            let randomX = x - size + Math.random() * 2 * size ;
            let randomY = y - size + Math.random() * 2 * size ;
            ctx.fillRect(randomX, randomY-SCREEN_CORR_FACTOR, 1, 1);
        }
        ctx.restore(); // Restore the state
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
        setPoints([]);
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
        // ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // draw current points if any
        points.forEach(point => {
            drawOnCanvas(point.x, point.y, point.color, point.size, point.type, point.xStart, point.yStart);
        });
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

    function oneStepBack(){
        if (points.length > 0){
            setPoints(prevPoints => prevPoints.slice(0, -1));
            drawFillColor(fillColor);
        }
    }

    function handleClearCommand() {
        const msg = {
            command: "clear"
        }
        send(JSON.stringify(msg))
    }

    function handleTouchStart(e) {
        if (penType === 'line') {
            const touch = e.touches[0];
            setStartPoint({
                x: touch.clientX,
                y: touch.clientY,
            });
        }
        else{
            const touch = e.touches[0];
            setCoords({
                x: touch.clientX,
                y: touch.clientY,
            });
        }
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

    function handleStepBack() {
        const msg = {
            command: "back"
        }
        send(JSON.stringify(msg))
    }
    
    function handleTextCursor(){
        setTextCursorActive(!textCursorActive);
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

                <canvas ref={canvasRef} width={canvasSize.x} height={canvasSize.y}
                        style={{width: '100%', height: '100%'}}/>

            </div>

            <DrawToolbar
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
                oneStepBack={handleStepBack}
            />
                        
            <DrawMenuToolbar copySuccess={copySuccess} copyToClipboard={copyToClipboard} roundTripTime={roundTripTime}
                             saveCanvasToPng={saveCanvasToPng} handleClearCommand={handleClearCommand} oneStepBack={oneStepBack}/>

            {textCursorActive ? 
                <TextCursor x={coords.x-5} y={coords.y-penSize*2} color={selectedColor} size={penSize} textContent={textContent}/> : null}
        
        </div>
    )
}