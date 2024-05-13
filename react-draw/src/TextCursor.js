import React, {useEffect} from 'react';
import './TextCursor.css';

function TextCursor({ x, y, color, size, textContent }) {
    
    useEffect(() =>{
        console.log("TextCursor: ", x, y)
        // set position of text-cursor to  x, y coordinates
        document.getElementById("text-cursor").style.left = x + "px";
        document.getElementById("text-cursor").style.top = y + "px";
        document.getElementById("text-cursor").style.fontSize = size + "px";        
        document.getElementById("text-content").style.left = x + "px";
        document.getElementById("text-content").style.top = y + "px";
        document.getElementById("text-content").style.fontSize = size + "px";
    }, []);

    return (
        <div>
            <div className={"text-content"} id={"text-content"}>
                {textContent}
            </div>
            <div className={"text-cursor"} id={"text-cursor"}>
                |
            </div>
        </div>
    );
}

export default TextCursor;