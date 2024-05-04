import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const Playground = () => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);
    const [GetOrderResponse, setGetOrderResponse] = useState('');
    const [PostOrderResponse, setPostOrderResponse] = useState('');
    const [PutOrderResponse, setPutOrderResponse] = useState('');
    const authState = useSelector((state) => state.auth);
    const [GetCartResponse, setGetCartResponse] = useState('');
    const [RecentOrderId, setRecentOrderId] = useState('');
    const [GetCommentResponse, setGetCommentResponse] = useState('');
    const [PostCommentResponse, setPostCommentResponse] = useState('');
    const [DeleteCommentResponse, setDeleteCommentResponse] = useState('');
    const [generatedReviewId, setGeneratedReviewId] = useState('');
    const [GetProductResponse, setGetProductResponse] = useState('');
    const [DeleteProductResponse, setDeleteProductResponse] = useState('');

    const handleGetOrderClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/order/"+authState.user.userId);
            const data = await res.json();
            setGetOrderResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostOrderClick = async () => {
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
                setRecentOrderId(data.order_id);
                setPostOrderResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    };

    const handlePutOrderClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/order/"+authState.user.userId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "order_id": RecentOrderId,
                    "status": "shipped"
                })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setPutOrderResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    }

    const handleGetCartClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/cart/"+authState.user.userId);
            const data = await res.json();
            setGetCartResponse(data);
        } catch (error) {
            console.error(error);
        }
    }








    const handleGetCommentClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-comment/1");
            const data = await res.json();
            setGetCommentResponse(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostCommentClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-comment/1", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({

                        "user_id": authState.user.userId,
                        "user": "Nilsen",
                        "rating": 3,
                        "title": "Mid",
                        "review": "Its mid tbh",
                        "date": "2024-03-03",
                        
                    
                })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setGeneratedReviewId(data.review_id);
                setPostCommentResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    }

    const handleDeleteCommentClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product-comment/1", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "review_id": generatedReviewId,
                    "user_id": authState.user.userId
                })
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setDeleteCommentResponse(data);
            } catch (err) {
                console.error('This does not look like a valid JSON: ', text);
                throw err;
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation: ', error);
        }
    }


    const handleGetProductClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product/1");
            const data = await res.json();
            setGetProductResponse(data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteProductClick = async () => {
        try {
            const res = await fetch(apigBaseUrl + "/product/1", {
                method: 'DELETE',
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
                setDeleteProductResponse(data);
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
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetOrderClick}>Send GET order Request</button>
            <p>GetOrderResponse: {JSON.stringify(GetOrderResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostOrderClick}>Send POST order Request</button>
            <p>PostOrderResponse: {JSON.stringify(PostOrderResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePutOrderClick}>Send PUT order Request</button>
            <p>PutOrderResponse: {JSON.stringify(PutOrderResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetCartClick}>Send GET cart Request</button>
            <p>GetCartResponse: {JSON.stringify(GetCartResponse)}</p>




            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetCommentClick}>Send GET comment Request</button>
            <p>GetCommentResponse: {JSON.stringify(GetCommentResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostCommentClick}>Send POST comment Request</button>
            <p>PostCommentResponse: {JSON.stringify(PostCommentResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteCommentClick}>Send DELETE comment Request</button>
            <p>DeleteCommentResponse: {JSON.stringify(DeleteCommentResponse)}</p>


            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleGetProductClick}>Send GET product Request</button>
            <p>GetProductResponse: {JSON.stringify(GetProductResponse)}</p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteProductClick}>Send DELETE product Request</button>
            <p>DeleteProductResponse: {JSON.stringify(DeleteProductResponse)}</p>

        </div>
    );
};
