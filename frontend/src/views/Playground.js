import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const Playground = () => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);
    const [GetResponse, setGetResponse] = useState('');
    const [PostResponse, setPostResponse] = useState('');
    const [PostBatchResponse, setPostBatchResponse] = useState('');
    const [PostCommentResponse, setPostCommentResponse] = useState('');
    const [GetCommentResponse, setGetCommentResponse] = useState('');
    const [DeleteResponse, setDeleteResponse] = useState('');
    const [GetDistributorResponse, setGetDistributorResponse] = useState('');
    const [GetCategoryResponse, setGetCategoryResponse] = useState('');

    const handleClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product/1");
            const data = await res.json();
            setGetResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "product_id": "1",
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
                setPostResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    const handleDeleteClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product/2", {
                method: 'DELETE'
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setDeleteResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    const handlePostBatchClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product/batch", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([
                    {
                      "product_id": "1",
                      "product": "Apple iPhone 15 Pro",
                      "highlighted": true,
                      "image": "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60",
                      "price": 57.46,
                      "formatted_text": "",
                      "category": "Smartphone",
                      "brand": "Apple"
                    },
                    {
                      "product_id": "2",
                      "product": "Apple MacBook Air",
                      "highlighted": true,
                      "image": "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60",
                      "price": 775.82,
                      "formatted_text": "",
                      "category": "Laptop",
                      "brand": "Apple"
                    },
                    {
                      "product_id": "3",
                      "product": "Samsung Galaxy S9",
                      "highlighted": true,
                      "image": "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60",
                      "price": 482.89,
                      "formatted_text": "",
                      "category": "Smartphone",
                      "brand": "Samsung"
                    }
                ])
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setPostBatchResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    const handlePostCommentClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-comment", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "product_id": "2",
                    "reviews": [
                      {
                        "user": "GamerGa999",
                        "rating": 4.5,
                        "title": "Bad for Gaming on the Go",
                        "comment": "Its just kinda shit",
                        "date": "2024-03-11"
                      }]
                  })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setPostCommentResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    const handleGetComment = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-comment/2");
            const data = await res.json();
            setGetCommentResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGetDistributorClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/distributor");
            const data = await res.json();
            setGetDistributorResponse(data);
        } catch (error) {
            console.error(error);
        }

    };

    const handleGetCategoryClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/category");
            const data = await res.json();
            setGetCategoryResponse(data);
        } catch (error) {
            console.error(error);
        }

    };

    return (
        <div>
            <p>API Gateway Base URL: {apigBaseUrl}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleClick}>Send GET Request</button>
            <p>GetResponse: {JSON.stringify(GetResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostClick}>Send POST Request</button>
            <p>PostResponse: {JSON.stringify(PostResponse)}</p>

            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteClick}>Send DELETE Request</button>
            <p>DeleteResponse: {JSON.stringify(DeleteResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostBatchClick}>Send POST Batch Request</button>
            <p>PostBatchResponse: {JSON.stringify(PostBatchResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostCommentClick}>Send POST Comment Request</button>
            <p>PostCommentResponse: {JSON.stringify(PostCommentResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetComment}>Send GET Comment Request</button>
            <p>GetCommentResponse: {JSON.stringify(GetCommentResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetDistributorClick}>Send GET Distributor Request</button>
            <p>GetDistributorResponse: {JSON.stringify(GetDistributorResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetCategoryClick}>Send GET Category Request</button>
            <p>GetCategoryResponse: {JSON.stringify(GetCategoryResponse)}</p>

        </div>
    );
};
