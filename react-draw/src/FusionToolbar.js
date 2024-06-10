import React, {useEffect, useState, useRef} from 'react';
import './FusionToolbar.css';

function FusionToolbar({ fusionFactor, setFusionFactor, pointCount }) {

    return(
        
        <div className={"fusion-toolbar"}>
            <div className={"range-container"}>
                <input type={"range"} min={1} max={100} step={1} value={fusionFactor}
                       onChange={e => setFusionFactor(parseFloat(e.target.value))}/>
                <div className="input-size">Fusion-Factor: {fusionFactor}</div>
            </div>
            <div className={"point-count"}>Points: {pointCount}</div>
        </div>

    );
}

export default FusionToolbar;