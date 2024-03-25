import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const Playground = () => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);
    const [response, setResponse] = useState('');

    const handleClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-microservice");
            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <p>API Gateway Base URL: {apigBaseUrl}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleClick}>Send GET Request</button>
            <p>Response: {response}</p>
        </div>
    );
};
