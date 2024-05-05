import React from 'react';

export const MouseContext = React.createContext({
    mouseDown: false,
    setMouseDown: () => {}
});