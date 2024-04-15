import {useDispatch, useSelector} from 'react-redux';
import { api, handleError } from './api';
import {getDomain} from "./getDomain";
import {PRODUCT_ENDPOINT} from "./constants";


export const useFetchAPIGURL = () => {
    const dispatch = useDispatch();

    return async () => {
        fetch('http://localhost:5000/apig_base_url')
            .then(response => response.text())
            .then(data => {
                dispatch({type: 'SET_APIG_BASE_URL', payload: data});
            })
            .catch(error => {
                handleError({
                    error: error,
                    message: "Failed to reach docker endpoint!"
                });
            });
    }
}

/**
 * Fetch all products
 * @param setAllProductsName
 * @param setLoading
 * @returns {Promise<void>}
 */

export const useFetchAllProducts = (setAllProductsName, setLoading) => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.get(`/${PRODUCT_ENDPOINT}`);
            setAllProductsName(response.data);
            setLoading(false);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to load products!"
            });
        }
    };
}
