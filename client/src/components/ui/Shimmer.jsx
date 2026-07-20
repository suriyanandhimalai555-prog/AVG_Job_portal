import React from 'react';

const Shimmer = ({ className = "" }) => {
    return (
        <div 
            className={`animate-pulse bg-gray-200/80 [animation-duration:3s] ${className}`}
            aria-hidden="true"
        ></div>
    );
};

export default Shimmer;