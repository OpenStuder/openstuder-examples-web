import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
    <React.StrictMode>
        <App host="192.168.1.61"/>
    </React.StrictMode>,
    document.getElementById('root')
);
