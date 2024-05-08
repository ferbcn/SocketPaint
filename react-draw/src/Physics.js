import React, {useEffect, useState, useRef} from 'react';
import './Physics.css';

import Toolbar from './Toolbar';
import repeatIcon from "./media/repeat.svg";

export default function Physics({ initColor, bgColor}) {
    const CANVAS_CORRECTION_Y_PIXELS = 55;
    
    const [canvasSize, setCanvasSize] = useState({x: null, y: null});
    const [coords, setCoords] = useState({x: 0, y: 0});
    const [mouseDown, setMouseDown] = useState(false);
    const [selectedColor, setSelectedColor] = useState(initColor);
    const [penSize, setPenSize] = useState(25);
    const [penType, setPenType] = useState("round");
    const canvasRef = useRef(null);
    const [fillColor, setFillColor] = useState(bgColor);

    const [points, setPoints] = useState([]);
    const [initpoints, setInitPoints] = useState([]);
    const [isToggled, setIsToggled] = useState(false);
    const [gravity, setGravity] = useState(0.9);
    const [airResistance, setairResistance] = useState(0.01);
    const [elasticity, setElasticity] = useState(1.0);
    
    let canvas = null;
    let ctx = null;
    
    useEffect(() => {
        
        // init canvas
        canvas = canvasRef.current;
        ctx = canvas.getContext('2d', {alpha: true});

        // prevent scrolling on touch devices
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, {passive: false});

        // handle window resize
        const handleResize = () => {
            canvas = canvasRef.current;
            ctx = canvas.getContext('2d');

            // Save current image data
            const imageData = canvas.toDataURL();

            // Resize the canvas
            setCanvasSize({
                x: window.innerWidth,
                y: window.innerHeight - 120
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
        
        // Start the animation interval
        //const animInterval = setInterval(animatePoints, 10); // milliseconds
        let animInterval = null;
        
        if (isToggled) {
            // If the toggle is on, start the animation
            animInterval = setInterval(animatePoints, 10); // milliseconds
        }
        
        // clean up event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animInterval) {
                clearInterval(animInterval);
            }
        };
        
    }, [isToggled]); 

    function handleTouch(e) {
        const touch = e.touches[0];
        setCoords({
            x: touch.clientX,
            y: touch.clientY - CANVAS_CORRECTION_Y_PIXELS,
        });
        setMouseDown(true);
        processPaint()
    }
    
    const handleMouseDown = event => {
        setMouseDown(true)
        processPaint()
    };
    const handleMouseUp = event => {
        setMouseDown(false)
    };
    
    const handleMouseMove = event => {
        setCoords({
            x: event.clientX,
            y: event.clientY - 55,
        });
        
        if (mouseDown) {
            processPaint()
        }
    };
    
    function processPaint() {
        const msg = {
            x: coords.x,
            y: coords.y,
            color: selectedColor,
            size: penSize,
            type: penType
        }
        processCommand(msg)
    }

    function handleClearCommand() {
        const msg = {
            command: "clear"
        }
        processCommand(msg)
    }

    function handleSelectedFillColor(fillColor){
        const msg = {
            command: "fill",
            color: fillColor
        }
        processCommand(msg)
    }
    
    function processCommand(msg) {
        // Basic drawing
        if (msg.hasOwnProperty('color') && msg.hasOwnProperty('size') && msg.hasOwnProperty('type')){
            drawOnCanvas(msg.x, msg.y, msg.color, msg.size, msg.type);
        }
        // Special commands
        else if (msg.hasOwnProperty('command')) {
            if (msg.command === 'clear') {
                setIsToggled(false)
                setPoints([]);
                setInitPoints([]);
                clearCanvas();
            }
            else if (msg.command === 'fill') {
                drawFillColor(msg.color);
            }
        }
    }
    
    function drawOnCanvas(x, y, color, size, type) {
        if (isToggled) {
            return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', {alpha: true});
        ctx.fillStyle = color;
        if (type === 'eraser') {
            clearRound(ctx, x, y, size)
        }
        else if (type === 'round') {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        else if (type === 'square') {
            ctx.fillRect(x-size/2, y-penSize/2, size, size);
        }
        else if (type === 'spray') {
            drawRoundSprayOnCanvas(ctx, x, y, color, size, type);
        }
        // Add the point to the points array
        setPoints(prevPoints => [...prevPoints, {x, y, color, size, type, speed: 0.0}]);
        setInitPoints(prevPoints => [...prevPoints, {x, y, color, size, type, speed: 0.0}])
    }
    
    function drawRoundSprayOnCanvas(ctx, x, y, color, size, type) {
        ctx.save(); // Save the current state
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.clip(); // Create a clipping region

        for (let i = 0; i < size; i++) {
            let randomX = x - size + Math.random() * 2 * size ;
            let randomY = y - size + Math.random() * 2 * size ;
            ctx.fillRect(randomX, randomY, 1, 1);
            
            // Add the point to the points array
            setPoints(prevPoints => [...prevPoints, {x, y, color, size, type, speed: 0.0}]);
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
        drawFillColor(bgColor);
        points.forEach(point => {
            setPoints(prevPoints => prevPoints.filter(p => p !== point));
        });
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
        // draw current points if any
        points.forEach(point => {
            drawOnCanvas(point.x, point.y, point.color, point.size, point.type);
        });
    }

    function handleTouchStart(e) {
        const touch = e.touches[0];
        setCoords({
            x: touch.clientX,
            y: touch.clientY,
        });
    }
    
    function reloadInitState() {
        setIsToggled(false)
        // clear the canvas
        clearCanvas();
        // reset points
        setPoints(initpoints);
        setIsToggled(true)
        // animatePoints();
        setIsToggled(false)
        // drawAllPointsOnCanvas();
    }

    function animatePoints() {
        if (!isToggled) {
            return;
        }
        points.forEach(point => {

            // Apply gravity
            point.speed += gravity;

            // Apply air resistance
            point.speed -= airResistance * point.speed;

            // Move the point
            point.y += point.speed;

            // Bounce if the point hits the floor, apply friction on bounce
            if (point.y + point.size > canvas.height) {
                point.speed *= -1;
                point.y = canvas.height - point.size;
                point.speed *= elasticity;
            }
        });
        drawAllPointsOnCanvas()
    }
    
    
    function drawAllPointsOnCanvas() {
        
        // clear the canvas with current fill color
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        points.forEach(point => {

            if (point.type === 'round') {
                // Redraw the point
                ctx.fillStyle = point.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
                ctx.fill();
            }
            else if (point.type === 'square') {
                ctx.fillStyle = point.color;
                ctx.fillRect(point.x-point.size/2, point.y-penSize/2, point.size, point.size);
            }

        });
        
    }

    const handleToggle = () => {
        setIsToggled(!isToggled);
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
            />

            <div className={"toggle-container"}>
                <button className={"tool-button"} onClick={reloadInitState}>
                    <img className={"small-icon"} alt="" src={repeatIcon}></img>
                </button>
                <label>
                    Animation: <input type="checkbox" checked={isToggled} onChange={handleToggle}/>
                    {isToggled ? 'ON' : 'OFF'}
                </label>
            </div>

        </div>
    )
}