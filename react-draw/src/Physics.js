import React, {useEffect, useState, useRef} from 'react';
import './Physics.css';

import PhysicsToolbar from './PhysicsToolbar';

import PhysicsExtraToolbar from "./PhysicsExtraToolbar";
import PhysicsMenuToolbar from "./PhysicsMenuToolbar";
import FusionToolbar from "./FusionToolbar";
import {send} from "./websocket";

export default function Physics({ initColor, bgColor}) {
        const CANVAS_CORRECTION_Y_PIXELS = 0;
    
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
    const [objects, setObjects] = useState([]);
    const [initPoints, setInitPoints] = useState([]);
    const [initObjects, setInitObjects] = useState([]);
    const [isToggled, setIsToggled] = useState(false);
    const [gravity, setGravity] = useState(0.1);
    const [airResistance, setairResistance] = useState(0.0);
    const [elasticity, setElasticity] = useState(1.0);
    const [timeOut, setTimeOut] = useState(10);
    const [removePoints, setRemovePoints] = useState([]);
    const [pointCount, setPointCount] = useState(0);
    
    const [isCleared, setIsCleared] = useState(false);
    const [fusionFactor, setFusionFactor] = useState(100);
    const [startPoint, setStartPoint] = useState({x: 0, y: 0});
    
    const [showToolbars, setShowToolbars] = useState(true);
    
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
        
        // set pointCount variable
        setPointCount(points.length);
        
        // clean up event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animInterval) {
                clearInterval(animInterval);
            }
        };
        
    }, [isToggled, gravity, elasticity, timeOut, isCleared, points, fusionFactor, showToolbars]);

    // handle window resize
    const handleResize = () => {

        // Save current image data
        const imageData = canvasRef.current.toDataURL();

        // Resize the canvas
        setCanvasSize({
            x: window.innerWidth,
            y: window.innerHeight - CANVAS_CORRECTION_Y_PIXELS
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
        if (penType === 'line') {
            setStartPoint({
                x: event.clientX,
                y: event.clientY,
            });
        }
        else{
            processPaint()
        }
    };
    const handleMouseUp = event => {
        if (penType === 'line' && mouseDown) {
            sendGeo()
        }
        setMouseDown(false)
    };

    const handleMouseMove = event => {
        setCoords({
            x: event.clientX,
            y: event.clientY - CANVAS_CORRECTION_Y_PIXELS,
        });
        if (penType !== 'line') {
            if (mouseDown) {
                processPaint()
            }
        }
    };

    function sendGeo() {
        const msg = {
            xStart: startPoint.x,
            yStart: startPoint.y,
            x: coords.x,
            y: coords.y,
            color: selectedColor,
            size: penSize,
            type: penType,
        }
        processCommand(msg)
    }
    
    function processPaint() {
        const msg = {
            x: coords.x,
            y: coords.y,
            color: selectedColor,
            size: penSize,
            type: penType,
            speedY: 0.0,
            speedX: 0.0 //getRandom(-10, 10)
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
        // Special commands
        if (msg.hasOwnProperty('command')) {
            if (msg.command === 'clear') {
                clearResetCanvas();
            }
            else if (msg.command === 'fill') {
                drawFullCanvasFillColor(msg.color);
            }
            else if (msg.command === 'init') {
                reloadInitState();
            }
        }
        // Basic drawing
        else {
            if (isToggled) {
                return
            }
            drawOnCanvas(msg.x, msg.y, msg.color, msg.size, msg.type, msg.xStart, msg.yStart);
            addPointsToLists(msg.x, msg.y, msg.color, msg.size, msg.type, msg.speedX, msg.speedY, msg.xStart, msg.yStart);
        }
    }
    
    function clearResetCanvas() {
        setIsToggled(false)
        setPoints([]);
        setObjects([]);
        setInitPoints([]);
        drawFullCanvasFillColor(fillColor);
    }
    
    function addPointsToLists(x, y, color, size, type, speedX, speedY, xStart, yStart) {
        // Add the point to the points array
        if (type === 'line') {
            setObjects(prevPoints => [...prevPoints, {x, y, color, size, type, speedX: speedX, speedY: speedY, xStart: xStart, yStart: yStart}]);
            setInitObjects(prevPoints => [...prevPoints, {x, y, color, size, type, speedX: speedX, speedY: speedY, xStart: xStart, yStart: yStart}]);
            
        }
        else {
            setPoints(prevPoints => [...prevPoints, {
                x,
                y,
                color,
                size,
                type,
                speedX: speedX,
                speedY: speedY,
                xStart: xStart,
                yStart: yStart
            }]);
            setInitPoints(prevPoints => [...prevPoints, {
                x,
                y,
                color,
                size,
                type,
                speedX: speedX,
                speedY: speedY,
                xStart: xStart,
                yStart: yStart
            }]);
        }
    }
    
    
    function drawOnCanvas(x, y, color, size, type, xStart, yStart) {
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
        else if (type === 'line') {
            ctx.beginPath();
            ctx.moveTo(xStart, yStart-CANVAS_CORRECTION_Y_PIXELS);
            ctx.lineTo(x, y-CANVAS_CORRECTION_Y_PIXELS);
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.stroke();
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
        setIsToggled(true);
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
            drawOnCanvas(point.x, point.y, point.color, point.size, point.type );
        });
        // draw objects 
        objects.forEach(object => {
            drawOnCanvas(object.x, object.y, object.color, object.size, object.type, object.xStart, object.yStart);
        });
        setIsToggled(false);
        
    }
    
    function reloadInitState() {
        setIsToggled(false)
        setPoints([]);
        initPoints.forEach(point => {
            setPoints(prevPoints => [...prevPoints, JSON.parse(JSON.stringify(point))]);
        });
        drawFullCanvasFillColor(fillColor);
    }

    function pointTouchesLine(point, line) {
        const dx = line.x - line.xStart;
        const dy = line.y - line.yStart;
        // const distance = Math.abs(dy * point.x - dx * point.y + line.x * line.yStart - line.y * line.xStart) / Math.sqrt(dy * dy + dx * dx);

        // Check if the point is within the bounds of the line segment
        const dot = (point.x - line.xStart) * (line.x - line.xStart) + (point.y - line.yStart) * (line.y - line.yStart);
        const len_sq = dx * dx + dy * dy;
        const param = dot / len_sq;

        let xx, yy;

        if (param < 0 || (line.x === line.xStart && line.y === line.yStart)) {
            xx = line.xStart;
            yy = line.yStart;
        }
        else if (param > 1) {
            xx = line.x;
            yy = line.y;
        }
        else {
            xx = line.xStart + param * dx;
            yy = line.yStart + param * dy;
        }

        const dx1 = point.x - xx;
        const dy1 = point.y - yy;

        return Math.sqrt(dx1 * dx1 + dy1 * dy1) < point.size;
    }
    
    function animatePoints() {
        if (!isToggled) {
            return;
        }
        points.forEach(point => {
            
            // check collision with objects
            objects.forEach(object => {
                // if point is inside object, bounce
                const line = {x: object.x, y: object.y, xStart: object.xStart, yStart: object.yStart};
                if (pointTouchesLine(point, line)){
                    const pointTrajectoryAngle = Math.atan2(point.speedY, point.speedX);
                    const lineAngle = Math.atan2(line.y - line.yStart, line.x - line.xStart);
                    // const angle = Math.atan2(point.y - object.y, point.x - object.x);
                    const angle = lineAngle + pointTrajectoryAngle;
                    // console.log("angle: ", angle, "lineAngle: ", lineAngle, "pointTrajectoryAngle: ", pointTrajectoryAngle);
                    // const angle = pointTrajectoryAngle; 
                    const offset = (point.size + object.size)/1; // You can adjust this value as needed
                    const targetX = point.x + Math.cos(angle) * (point.size + object.size) + offset;
                    const targetY = point.y + Math.sin(angle) * (point.size + object.size) + offset;
                    const ax = (targetX - point.x) * elasticity/20;
                    const ay = (targetY - point.y) * elasticity/20;
                    point.speedX *= -ax;
                    point.speedY *= -ay;
                    point.color = object.color;
                }
            });

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
            // Bounce if the point hits the ceiling
            else if (point.y - point.size < 0) {
                point.speedY *= -1;
                point.y = point.size;
                point.speedY *= elasticity;
            }
            
            // collision detection, bounce when hit by other point
            const FUSION_LEVEL = fusionFactor;
            
            points.forEach(otherPoint => {
                if (point !== otherPoint) {
                    const dx = point.x - otherPoint.x;
                    const dy = point.y - otherPoint.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < point.size + otherPoint.size) {
                        // if speed of both points larger than _ then combine both points into one point
                        if (Math.abs(point.speedX) + Math.abs(otherPoint.speedX) > FUSION_LEVEL || Math.abs(point.speedY) + Math.abs(otherPoint.speedY) > FUSION_LEVEL){
                            point.x = (point.x + otherPoint.x) / 2;
                            point.y = (point.y + otherPoint.y) / 2;
                            point.size = (point.size + otherPoint.size) / 2;
                            point.speedX = (point.speedX + otherPoint.speedX) / 2;
                            point.speedY = (point.speedY + otherPoint.speedY) / 2;
                            
                            // add point to points to remove list
                            //setRemovePoints(prevPoints => prevPoints.filter(p => p !== otherPoint));
                            setPoints(prevPoints => prevPoints.filter(p => p !== otherPoint));
                            
                            // combine colors of both points
                            const color1 = point.color;
                            const color2 = otherPoint.color;
                            const r1 = parseInt(color1.slice(1,3), 16);
                            const g1 = parseInt(color1.slice(3,5), 16);
                            const b1 = parseInt(color1.slice(5,7), 16);
                            const r2 = parseInt(color2.slice(1,3), 16);
                            const g2 = parseInt(color2.slice(3,5), 16);
                            const b2 = parseInt(color2.slice(5,7), 16);
                            const r = Math.floor((r1 + r2) / 2);
                            const g = Math.floor((g1 + g2) / 2);
                            const b = Math.floor((b1 + b2) / 2);
                            point.color = "#" + r.toString(16) + g.toString(16) + b.toString(16);
                        }
                        else{
                            const angle = Math.atan2(dy, dx);
                            const offset = (point.size + otherPoint.size)/2; // You can adjust this value as needed
                            const targetX = otherPoint.x + Math.cos(angle) * (point.size + otherPoint.size) + offset;
                            const targetY = otherPoint.y + Math.sin(angle) * (point.size + otherPoint.size) + offset;
                            const ax = (targetX - point.x) * elasticity/10;
                            const ay = (targetY - point.y) * elasticity/10;
                            point.speedX -= ax;
                            point.speedY -= ay;
                            otherPoint.speedX += ax;
                            otherPoint.speedY += ay;
                        }
                    }
                }
            });
            
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
        //pointsToRemove();
        drawAllPointsOnCanvas()
    }
    
    // function pointsToRemove() {
    //     removePoints.forEach(point => {
    //         setPoints(prevPoints => prevPoints.filter(p => p !== point));
    //     });
    //     setRemovePoints([]);
    // }
    
    
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
            } else if (point.type === 'square') {
                ctx.fillStyle = point.color;
                ctx.fillRect(point.x - point.size, point.y - penSize, point.size * 2, point.size * 2);
            } else if (point.type === 'spray') {
                drawRoundSprayOnCanvas(point.ctx, point.x, point.y, point.color, point.size, point.type);
            }
        });
        objects.forEach(point => {
            if (point.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(point.xStart, point.yStart-CANVAS_CORRECTION_Y_PIXELS);
                ctx.lineTo(point.x, point.y-CANVAS_CORRECTION_Y_PIXELS);
                ctx.strokeStyle = point.color;
                ctx.lineWidth = point.size;
                ctx.stroke();
            }
        });
        
    }

    const handleToggle = () => {
        setIsToggled(!isToggled);
    }
    
    function oneStepBack(){
        if (points.length > 0){
            setPoints(prevPoints => prevPoints.slice(0, -1));
            drawFullCanvasFillColor(fillColor);
            drawAllPointsOnCanvas();
        }    
    }
    
    function handleShowToolbars(){
        setShowToolbars(!showToolbars);
    }
    
    function handleReloadInitState(){
        const msg = {
            command: "init",
        }
        processCommand(msg)
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
            
            <PhysicsMenuToolbar 
                isToggled={isToggled} handleToggle={handleToggle} reloadInitState={handleReloadInitState} 
                pointCount={pointCount} oneStepBack={oneStepBack} 
                showToolbars={showToolbars} handleShowToolbar={handleShowToolbars} handleClearCommand={handleClearCommand}/>

            {showToolbars && <PhysicsToolbar
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
                oneStepBack={oneStepBack}
            />}

            {showToolbars && <PhysicsExtraToolbar 
                gravity={gravity} elasticity={elasticity}
                setGravity={setGravity} setElasticity={setElasticity}
                timeOut={timeOut} setTimeOut={setTimeOut}/>}

            {showToolbars && <FusionToolbar 
                fusionFactor={fusionFactor} setFusionFactor={setFusionFactor} pointCount={pointCount}/>}
            
        </div>
    )
}