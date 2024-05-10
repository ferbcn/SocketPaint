import React, {useEffect, useState, useRef} from 'react';
import './AnimToolbar.css';

import Draggable from 'react-draggable';

import repeatIcon from './media/repeat.svg';
import playIcon from "./media/play.svg";
import pauseIcon from "./media/pause.svg";

function AnimToolbar({ isToggled, handleToggle, reloadInitState }) {

    return (
        <div>
            <div className={"toggle-container"}>
                <button className={"tool-button"} onClick={reloadInitState}>
                    <img className={"small-icon"} alt="" src={repeatIcon}></img>
                </button>
                <label>
                    <button className={"tool-button"} onClick={handleToggle} style={{ backgroundColor: isToggled ? 'var(--accentColor)' : 'initial' }}
                    >
                        <img className={"small-icon"} alt="" src={playIcon}></img>
                        <img className={"small-icon"} alt="" src={pauseIcon}></img>
                    </button>
                </label>
            </div>
        </div>
    );
}

export default AnimToolbar;