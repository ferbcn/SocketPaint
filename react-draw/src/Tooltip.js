import React from 'react';
import './Tooltip.css'; // Create this file to add custom styles to your tooltip

const Tooltip = ({ message }) => {
    return (
        <div className="tooltip">
            {message}
        </div>
    );
};

export default Tooltip;