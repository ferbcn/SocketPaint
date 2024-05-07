import React from 'react';

import saveIcon from './media/floppy-disk.svg';
import clearIcon from './media/trash-can.svg';
import paintbrushIcon from './media/paintbrush.svg';
import palette from './media/palette.svg';
import bucket from './media/bucket.svg';

import './Toolbar.css';

function Toolbar({ handleClearCommand, saveCanvasToPng, fillColor, handleSelectedFillColor, selectedColor, setSelectedColor, penType, setPenType, penSize, setPenSize }) {
    
    const toolOptions = ["round", "square", "spray", "eraser"];
    
    return (
        <div>
            <div className={"container-row"}>
                <div className={"container-data"}>
                    <div className={"tool-item"}>
                        <button className={"tool-button"} type={"button"} onClick={handleClearCommand}>
                            <img className={"small-icon"} alt={"Clear canvas!"} src={clearIcon}></img>
                        </button>
                        <button className={"tool-button"} type={"button"} value={"\u239A"} onClick={saveCanvasToPng}>
                            <img className={"small-icon"} alt={"Save canvas"} src={saveIcon}></img>
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
                                {toolOptions.map(option => (
                                    <option value={option}>{option}</option>
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
        </div>
    );
}

export default Toolbar;