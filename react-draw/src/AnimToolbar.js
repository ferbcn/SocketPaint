import React from 'react';
import './AnimToolbar.css';

import repeatIcon from './media/repeat.svg';
import playIcon from "./media/play.svg";
import pauseIcon from "./media/pause.svg";
import backIcon from "./media/backward-step.svg";

function AnimToolbar({ isToggled, handleToggle, reloadInitState, oneStepBack }) {

    return (
        <div className={"anim-container"}>
            
            <button className={"tool-button"} onClick={oneStepBack}>
                <img className={"small-icon"} alt="" src={backIcon}></img>
            </button>
            
            <button className={"tool-button"} onClick={reloadInitState}>
                <img className={"small-icon"} alt="" src={repeatIcon}></img>
            </button>
            
            <button className={"tool-button"} onClick={handleToggle} style={{ backgroundColor: isToggled ? 'var(--accentColor)' : 'initial' }}>
                <img className={"small-icon"} alt="" src={playIcon}></img>
                <img className={"small-icon"} alt="" src={pauseIcon}></img>
            </button>
            
        </div>
    );
}

export default AnimToolbar;