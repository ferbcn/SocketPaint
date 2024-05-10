import React, {useEffect, useState, useRef} from 'react';
import './Physics.css';

import Toolbar from './Toolbar';

import PhysicsToolbar from "./PhysicsToolbar";
import AnimToolbar from "./AnimToolbar";

export default function Physics({ initColor, bgColor}) {
        const CANVAS_CORRECTION_Y_PIXELS = 55;
    
    const [canvasSize, setCanvasSize] = useState({x: null, y: null});
    const [coords, setCoords] = useState({x: 0, y: 0});
    const [mouseDown, setMouseDown] = useState(false);
    const [selectedColor, setSelectedColor] = useState(initColor);
    const [penSize, setPenSize] = useState(25);
    const [penType, setPenType] = useState("round");
    const [fillColor, setFillColor] = useState(bgColor);
    
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [points, setPoints] = useState([]);
    const [initPoints, setInitPoints] = useState([]);
    const [isToggled, setIsToggled] = useState(false);
    const [gravity, setGravity] = useState(0.1);
    const [airResistance, setairResistance] = useState(0.01);
    const [elasticity, setElasticity] = useState(1.0);
    const [timeOut, setTimeOut] = useState(10);
    
    useEffect(() => {
        
        // init canvas
        ctxRef.current = canvasRef.current.getContext('2d', {alpha: true});

        // prevent scrolling on touch devices
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, {passive: false});

        // call handleResize immediately to set initial size
        handleResize();

        // set up event listener for window resize
        window.addEventListener('resize', handleResize);
        
        // Start the animation interval
        let animInterval = null;
        if (isToggled) {
            // If the toggle is on, start the animation
            animInterval = setInterval(animatePoints, timeOut); // milliseconds
        }
        
        // clean up event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animInterval) {
                clearInterval(animInterval);
            }
        };
        
    }, [isToggled]);

    // handle window resize
    const handleResize = () => {

        // Save current image data
        const imageData = canvasRef.current.toDataURL();

        // Resize the canvas
        setCanvasSize({
            x: window.innerWidth,
            y: window.innerHeight - 60
        });

        // Create a new image and set its source to the saved image data
        const img = new Image();
        img.src = imageData;

        // When the image loads, draw it on the resized canvas
        img.onload = function() {
            ctxRef.current.drawImage(img, 0, 0);
        };
    };

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
            type: penType,
            speedY: 0.0,
            speedX: getRandom(-10, 10)
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

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function processCommand(msg) {
        console.log("Message: ", msg);
        // Basic drawing
        if (msg.hasOwnProperty('color') && msg.hasOwnProperty('size') && msg.hasOwnProperty('type')){
            if (isToggled) {
                return
            }
            drawOnCanvas(msg.x, msg.y, msg.color, msg.size, msg.type);
            addPointsToLists(msg.x, msg.y, msg.color, msg.size, msg.type, msg.speedX, msg.speedY);
        }
        // Special commands
        else if (msg.hasOwnProperty('command')) {
            if (msg.command === 'clear') {
                setIsToggled(false)
                setPoints([]);
                setInitPoints([]);
                drawFullCanvasFillColor(bgColor);
            }
            else if (msg.command === 'fill') {
                drawFullCanvasFillColor(msg.color);
            }
        }
    }
    
    function addPointsToLists(x, y, color, size, type, speedX, speedY) {
        // Add the point to the points array
        setPoints(prevPoints => [...prevPoints, {x, y, color, size, type, speedX: speedX, speedY: speedY}]);
        setInitPoints(prevPoints => [...prevPoints, {x, y, color, size, type, speedX: speedX, speedY: speedY}]);
    }
    
    
    function drawOnCanvas(x, y, color, size, type) {
        if (isToggled) {
            return;
        }
        const ctx = ctxRef.current;
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
            ctx.fillRect(x-size, y-penSize, size*2, size*2);
        }
        else if (type === 'spray') {
            drawRoundSprayOnCanvas(ctx, x, y, color, size, type);
        }
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
            setPoints(prevPoints => [...prevPoints, {x, y, color, size, type, speedX: 0.0, speedY: 0.0}]);
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
    
    function saveCanvasToPng() {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function drawFullCanvasFillColor(color) {
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
            drawOnCanvas(point.x, point.y, point.color, point.size, point.type);
        });
        
    }
    
    function reloadInitState() {
        setIsToggled(false)
        setPoints([]);
        initPoints.forEach(point => {
            setPoints(prevPoints => [...prevPoints, JSON.parse(JSON.stringify(point))]);
        });
        drawFullCanvasFillColor(bgColor);
        drawAllPointsOnCanvas();
    }

    function animatePoints() {
        if (!isToggled) {
            return;
        }
        points.forEach(point => {

            // Apply gravity
            point.speedY += gravity;
            
            // Apply air resistance
            point.speedY -= airResistance * point.speedY;
            point.speedX -= airResistance * point.speedX;
            
            // Move the point
            point.y += point.speedY;
            point.x += point.speedX;

            // Bounce if the point hits the floor, apply friction on bounce
            if (point.y + point.size > canvasRef.current.height) {
                point.speedY *= -1;
                point.y = canvasRef.current.height - point.size;
                point.speedY *= elasticity;
            }
            
            // Bounce if the point hits walls
            if (point.x + point.size > canvasRef.current.width) {
                point.speedX *= -1;
                point.x = canvasRef.current.width - point.size;
                point.speedX *= elasticity;
            }
            else if (point.x - point.size < 0) {
                point.speedX *= -1;
                point.x = point.size;
                point.speedX *= elasticity;
            }
            
            
        });
        drawAllPointsOnCanvas()
    }
    
    
    function drawAllPointsOnCanvas() {
        
        const ctx = ctxRef.current;
        // clear the canvas with current fill color
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
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
                ctx.fillRect(point.x-point.size, point.y-penSize, point.size*2, point.size*2);
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
            
            <AnimToolbar isToggled={isToggled} handleToggle={handleToggle} reloadInitState={reloadInitState}/>

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
            
            <PhysicsToolbar gravity={gravity} elasticity={elasticity}
                            setGravity={setGravity} setElasticity={setElasticity}
                            timeOut={timeOut} setTimeOut={setTimeOut}/>
            
            
            

        </div>
    )
}