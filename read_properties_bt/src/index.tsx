import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import logo from "./OpenStuder.svg";

ReactDOM.render(
    <React.StrictMode>
        <header>
            <img src={logo} alt="" className="logo"/>
        </header>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
