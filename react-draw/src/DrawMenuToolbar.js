import React from 'react';
import './DrawMenuToolbar.css';

import saveIcon from "./media/floppy-disk.svg";
import copyIcon from "./media/share-nodes.svg";
import clearIcon from "./media/trash-can.svg";
import backIcon from "./media/backward-step.svg";

function DrawMenuToolbar({ copySuccess, copyToClipboard, roundTripTime, saveCanvasToPng, handleClearCommand, oneStepBack }) {

    return (
        <div className={"codraw-container"}>
            
            <button className={"tool-button"} type={"button"} onClick={oneStepBack}>
                <img className={"small-icon"} alt={"Save canvas"} src={backIcon}></img>
            </button>
            
            <button className={"tool-button"} type={"button"} onClick={handleClearCommand}>
                <img className={"small-icon"} alt={"Clear canvas!"} src={clearIcon}></img>
            </button>

            <button className={"tool-button"} onClick={saveCanvasToPng}>
                <img className={"small-icon"} alt="" src={saveIcon}></img>
            </button>
            
            <button className={"tool-button"} onClick={copyToClipboard}>
                <img className={"small-icon"} alt="" src={copyIcon}></img>
            </button>

            <div className={"link-text-container"}>
                {roundTripTime ? <div>RTT: {roundTripTime} ms</div> : null}
            </div>

            <div className={"link-text-container"}>
                {copySuccess ? <div className={"copy-info-tag"}>{copySuccess}</div> : <span></span>}
            </div>


        </div>
    )
        ;
}

export default DrawMenuToolbar;