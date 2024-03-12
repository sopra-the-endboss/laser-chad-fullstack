import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AllProductsnameMock from "../data/AllProductsNameMock.json"
import {useNavigate} from "react-router-dom";
const Navbar = ({setData, searchQuerySubmitted}) => {

    const navigate = useNavigate();
    const searchWithinProducts = (event) => {
        //TODO: insert search items in backend.
        // returned products will be set and content will be generated accordingly
        // currently filtering is extremely strict, use levenstein distance or fuse.js to also account for misspells.
        const filtered = AllProductsnameMock.filter(product => product.product.toLowerCase().includes(event.target.value.toLowerCase()));

        if(event.keyCode === 13 && event.target.value){
            navigate('/');
            searchQuerySubmitted(true);
            setData(filtered);
        }
        else if(event.keyCode === 13){
            searchQuerySubmitted(false);
            setData(filtered);
        }
    }

    return (
        <nav className="bg-white shadow fixed top-0 left-0 w-full z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 mb-4">
                <div className="relative flex items-center justify-between h-16">
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                            ICON
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                <a href="/" className="text-gray-800 px-3 py-2 rounded-md text-sm font-medium" aria-current="page">Overview</a>
                                <a href="/categories" className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Categories</a>
                                <a href="/shopping-cart" className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Shopping Cart</a>
                                <a href="/pinned" className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Pinned Products</a>
                                <a href="/login" className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <div className="ml-3 relative flex items-center">
                            <input type="text" className="h-10 pl-10 pr-2 rounded-md text-sm border-gray-300" placeholder="Search..." onKeyDown={(e) => searchWithinProducts(e)} />
                            <SearchIcon className="absolute left-3 h-5 w-5 text-gray-500 pl-2" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
