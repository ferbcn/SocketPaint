import React from 'react';
import './CoToolbar.css';

import saveIcon from "./media/floppy-disk.svg";
import copyIcon from "./media/share-nodes.svg";

function CoToolbar({ copySuccess, copyToClipboard, roundTripTime, saveCanvasToPng }) {

    return (
        <div className={"codraw-container"}>

            <div className={"link-text-container"}>
                {roundTripTime ? <div>RTT: {roundTripTime} ms</div> : null}
            </div>
            
            <div className={"link-text-container"}>
                {copySuccess ? <div className={"copy-info-tag"}>{copySuccess}</div> : <span>Copy Link:</span>}
            </div>
            
            <button className={"tool-button"} onClick={copyToClipboard}>
                <img className={"small-icon"} alt="" src={copyIcon}></img>
            </button>

            <button className={"tool-button"} onClick={saveCanvasToPng}>
                <img className={"small-icon"} alt="" src={saveIcon}></img>
            </button>
            
        </div>
    )
        ;
}

export default CoToolbar;