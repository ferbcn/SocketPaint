import React from 'react';

import clearIcon from './media/trash-can.svg';
import paintbrushIcon from './media/paintbrush.svg';
import palette from './media/palette.svg';
import bucket from './media/bucket.svg';

import './Toolbar.css';
import backIcon from './media/backward-step.svg';

function Toolbar({ handleClearCommand, fillColor, handleSelectedFillColor, selectedColor, setSelectedColor, penType, setPenType, penSize, setPenSize, oneStepBack}) {
    
    const toolOptions = ["round", "square", "spray", "line", "eraser"];
    
    return (
        <div>
                <div className={"tool-button-container"}>
                    <div className={"container-center"}>
                        <button className={"tool-button"} type={"button"} onClick={handleClearCommand}>
                            <img className={"small-icon"} alt={"Clear canvas!"} src={clearIcon}></img>
                        </button>
                        <button className={"tool-button"} type={"button"} onClick={oneStepBack}>
                            <img className={"small-icon"} alt={"Save canvas"} src={backIcon}></img>
                        </button>
                    </div>
                    <div className={"tool-item"}>
                        <img alt="" src={bucket} className={"icon-white"}/>
                        <input type={"color"} value={fillColor}
                               onChange={e => handleSelectedFillColor(e.target.value)}/>
                    </div>
                    <div className={"tool-item"}>
                        <span>
                            <img alt="" src={palette} className={"icon-white"}/>
                            <input type={"color"} value={selectedColor}
                                   onChange={e => setSelectedColor(e.target.value)}/>
                        </span>
                        <span>
                            <img alt="" src={paintbrushIcon} className={"icon-white"}/>
                            <select value={penType} onChange={e => {
                                setPenType(e.target.value);
                                }}>
                                {toolOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </span>
                    </div>
                    <div className={"tool-item"}>
                        <input type={"range"} min={1} max={50} value={penSize}
                               onChange={e => setPenSize(e.target.value)}/>
                        <div className="input-size">Size: {penSize}</div>
                    </div>
                    
                </div>
        </div>
    );
}

export default Toolbar;