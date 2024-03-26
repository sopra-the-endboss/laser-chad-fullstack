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

    const haldePostClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-microservice", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "product_id": 1,
                    "product": "Apple iPhone 15 Pro",
                    "highlighted": true,
                    "image": "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60",
                    "price": 57.46,
                    "formatted_text": "",
                    "category": "Smartphone",
                    "brand": "Apple"
                  })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                // Use data here
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    return (
        <div>
            <p>API Gateway Base URL: {apigBaseUrl}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleClick}>Send GET Request</button>
            <p>Response: {JSON.stringify(response)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={haldePostClick}>Send POST Request</button>
            <p>Response: {JSON.stringify(response)}</p>

        </div>
    );
};
