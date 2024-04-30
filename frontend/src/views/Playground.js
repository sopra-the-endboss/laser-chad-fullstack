import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const Playground = () => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);
    const [GetResponse, setGetResponse] = useState('');
    const [PostResponse, setPostResponse] = useState('');
    const authState = useSelector((state) => state.auth);

    const handleGetClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/order/"+authState.user.userId);
            const data = await res.json();
            setGetResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/order/"+authState.user.userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setPostResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    const handlePutClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/order/"+authState.user.userId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "order_id": "123",
                    "status": "shipped"
                })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setPostResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    }



    return (
        <div>
            <p>API Gateway Base URL: {apigBaseUrl}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetClick}>Send GET Request</button>
            <p>GetResponse: {JSON.stringify(GetResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostClick}>Send POST Request</button>
            <p>PostResponse: {JSON.stringify(PostResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePutClick}>Send POST Request</button>
            <p>PutResponse: {JSON.stringify(PutResponse)}</p>

        </div>
    );
};
