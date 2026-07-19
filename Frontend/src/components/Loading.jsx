import React from 'react';
import './Loading.scss';

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="spinner">
                <div className="circle"></div>
                <div className="circle"></div>
            </div>
            <p>Loading AI Interview...</p>
        </div>
    );
};

export default Loading;
