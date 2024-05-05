import React, { useState } from 'react';

import './Avatar.css';
import Tooltip from './Tooltip';

import avatar0 from "./media/avatar0.png";
import avatar1 from "./media/avatar1.png";
import avatar2 from "./media/avatar2.png";
import avatar3 from "./media/avatar3.png";
import avatar4 from "./media/avatar4.png";
import avatar5 from "./media/avatar5.png";
import avatar6 from "./media/avatar6.png";
import avatar7 from "./media/avatar7.png";
import avatar8 from "./media/avatar8.png";

const Avatar = ({ avatar, setAvatar, isClickable, tooltipMessage }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const images = [
        avatar0,
        avatar1,
        avatar2,
        avatar3,
        avatar4,
        avatar5,
        avatar6,
        avatar7,
        avatar8,
    ];

    // Function to handle the image click event
    const handleClick = () => {
        if (!isClickable) {
            return;
        }
        // Update the index to the next image in the list, wrap around if at the end
        setAvatar((avatar + 1) % images.length);
    };

    return (
        <div className="container">
            <img className={isClickable ? "large-avatar" : "small-avatar"} alt="Avatar"
                 src={images[avatar]}
                 onClick={handleClick} // Set the onClick handler
                 style={{ cursor: isClickable ? 'pointer' : 'default' }} // Change cursor to indicate it's clickable
                 onMouseEnter={() => setShowTooltip(!!isClickable)}
                 onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && <Tooltip message={tooltipMessage} />}
        </div>
    );
};

export default Avatar;