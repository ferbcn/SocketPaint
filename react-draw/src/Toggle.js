import './Toggle.css';
import React, {useEffect} from "react";

export default function Toggle({ isToggled, handleToggle }) {
  return (
      useEffect(() => {
          console.log("Toggle component mounted");
      }, [isToggled]),
          
      <div className="toggle-container">
          <input
              checked={isToggled}
              onChange={handleToggle}
              className="toggle-checkbox"
              id="toggle"
              type="checkbox"
          />
          <label>
              {isToggled ? 'ON' : 'OFF'}
          </label>
      </div>
  );
}
