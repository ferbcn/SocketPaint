import React from 'react';

import copyIcon from './media/copy-icon.png';
import saveIcon from './media/save-icon.png';
import clearIcon from './media/clear-icon.png';
import brushIcon from './media/brush.svg';

import './Toolbar.css';

function Toolbar({ handleClearCommand, saveCanvasToPng, fillColor, handleSelectedFillColor, selectedColor, setSelectedColor, penType, setPenType, penSize, setPenSize, copyToClipboard, copySuccess }) {
    return (
        <div>
            <div className={"container-row"}>
                <div className={"container-data"}>
                    <div className={"tool-button-container"}>
                        <button className={"tool-button"} type={"button"} onClick={handleClearCommand}>
                            <img className={"small-icon"} alt={"Clear canvas!"} src={clearIcon}></img>
                        </button>
                        <button className={"tool-button"} type={"button"} value={"\u239A"} onClick={saveCanvasToPng}>
                            <img className={"small-icon"} alt={"Save canvas"} src={saveIcon}></img>
                        </button>
                    </div>
                    <div className={"tool-item"}>
                        Fill:
                        <input type={"color"} value={fillColor}
                               onChange={e => handleSelectedFillColor(e.target.value)}/>
                    </div>
                    <div className={"tool-item"}>
                        <img alt="" src={brushIcon} className={"icon-white"}/>
                        <input type={"color"} value={selectedColor}
                               onChange={e => setSelectedColor(e.target.value)}/>
                        <select value={penType} onChange={e => {
                            setPenType(e.target.value);
                        }}>
                            <option value="round">Round</option>
                            <option value="square">Square</option>
                            <option value="eraser">Eraser</option>
                        </select>
                    </div>
                    <div>
                        <input type={"range"} min={1} max={50} value={penSize}
                               onChange={e => setPenSize(e.target.value)}/>
                        Size: {penSize}
                    </div>
                </div>
            </div>
            <div className={"link-container"}>
                Copy Session Link:
                <button onClick={copyToClipboard}>
                    <img className={"small-icon"} alt="" src={copyIcon}></img>
                </button>
                <div className={"info-tag"}>
                    {copySuccess ? <span>{copySuccess}</span> : null}
                </div>
            </div>
        </div>
    );
}

export default Toolbar;