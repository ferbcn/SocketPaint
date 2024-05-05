import React, { useEffect } from 'react';
import { startWebsocketConnection } from './websocket';

const WebSocketManager = ({ endpoint, children }) => {
    useEffect(() => {
        startWebsocketConnection({ endpoint });

        // Close the WebSocket connection when the component unmounts
        return () => {
            if (window.ws && window.ws.close) {
                window.ws.close();
            }
        };
    }, [endpoint]);

    return children;
};

export default WebSocketManager;