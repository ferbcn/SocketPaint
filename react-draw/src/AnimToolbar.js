import React from 'react';
import './AnimToolbar.css';

import repeatIcon from './media/repeat.svg';
import playIcon from "./media/play.svg";
import pauseIcon from "./media/pause.svg";
import backIcon from "./media/backward-step.svg";
import miniIcon from "./media/minimize.svg";

function AnimToolbar({ isToggled, handleToggle, reloadInitState, oneStepBack, showToolbars, handleShowToolbar }) {

    return (
        <div className={"anim-container"}>
            
            <button className={"tool-button"} onClick={handleShowToolbar} style={{ backgroundColor: showToolbars ?  'initial' : 'var(--accentColor)' }}>
                <img className={"small-icon"} alt="" src={miniIcon}></img>
            </button>
            
            <button className={"tool-button"} onClick={oneStepBack}>
                <img className={"small-icon"} alt="" src={backIcon}></img>
            </button>
            
            <button className={"tool-button"} onClick={reloadInitState}>
                <img className={"small-icon"} alt="" src={repeatIcon}></img>
            </button>
            
            <button className={"tool-button"} onClick={handleToggle} style={{ backgroundColor: isToggled ? 'initial':'var(--accentColor)' }}>
                <img className={"small-icon"} alt="" src={playIcon}></img>
                <img className={"small-icon"} alt="" src={pauseIcon}></img>
            </button>
            
        </div>
    );
}

export default AnimToolbar;