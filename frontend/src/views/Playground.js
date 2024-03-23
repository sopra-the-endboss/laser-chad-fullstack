import React, { useState } from 'react';


const Playground = ({ apig_base_url }) => {
    const [response, setResponse] = useState('');

    const sendRequest = async () => {
        console.log('Sending request to:', apig_base_url + '/product-microservice');
        try {
            const res = await fetch(apig_base_url + '/product-microservice');
            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchJson = async () => {
        console.log('Fetching JSON from:', 'data/shared_volume/apig_base_url.json');
        try {
            const res = await fetch('../data/shared_volume/apig_base_url.json');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={sendRequest}>
                Send Request
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={fetchJson}>
                Fetch JSON
            </button>
            <p>{response}</p>
        </div>
    );
};

export default Playground;
