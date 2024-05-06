import {useDispatch, useSelector} from 'react-redux';
import { api, handleError } from './api';
import {getDomain} from "./getDomain";
import {
    PRODUCT_CATEGORY,
    PRODUCT_COMMENT_ENDPOINT,
    PRODUCT_DISTRIBUTOR,
    PRODUCT_ENDPOINT
} from "./constants";


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

export const usePostNewProduct = (productToPost, setLoading, setCreatedProductId) => {
    const authState = useSelector((state) => state.auth);

    const sellerId = authState.user.userId;
    productToPost.seller_id = sellerId;
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.post(`/${PRODUCT_ENDPOINT}`, productToPost);
            setCreatedProductId(response.data.product_id)
            setLoading(false);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to post product!"
            });
        }
    };
}

export const useDeleteProduct = (productId, setLoading) => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.delete(`/${PRODUCT_ENDPOINT}/${productId}`);
            console.log(response);
            setLoading(false);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to delete product!"
            });
        }
    };
}

export const useFetchDistributor = (setAllDistributors) => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.get(`/${PRODUCT_DISTRIBUTOR}`);
            console.log(response);
            setAllDistributors(response.data);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to fetch all distributors!"
            });
        }
    };
}
export const useFetchCategories = (setAllCategories) => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.get(`/${PRODUCT_CATEGORY}`);
            console.log(response);
            setAllCategories(response.data);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to fetch all categories!"
            });
        }
    };
}


export const useFetchAllComments = (details, product_id, setLoadingComments) => {

    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            if (!details) {

                const response = await api.get(`/${PRODUCT_COMMENT_ENDPOINT}/${product_id}`)
                
                console.log("DEBUG: useFetchAllComments response");
                console.log(response);
                
                if (response) {
                    return response.data;
                }

            } else if(details) {
                setLoadingComments(false);
            }
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to load comments!",
            });
        }
    };
}

export const useFetchProductDetails = (details, product_id, setProductDetails, setLoadingDetails) => {

    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            if (!details) {
                const response = await api.get(`/${PRODUCT_ENDPOINT}/${product_id}`)

                console.log("DEBUG: useFetchProductDetails response");
                console.log(response);

                setProductDetails(response.data[0]);
                setLoadingDetails(false);
            } else if(details) {
                setLoadingDetails(false);
            }
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to load product!",
            });
        }
    };
}



export const usePostComment = (setLoadingComments, setComments, comment, productComments, product_id) => {

    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.post(`/${PRODUCT_COMMENT_ENDPOINT}/${product_id}`, comment);
            console.log(response);
            const copy = {...productComments}
            copy.reviews.push(comment);
            setComments(copy);
            setLoadingComments(false);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to post comment!",
            });
        }
    };
}

export const useDeleteComment = (commentId, setLoading) => {
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    return async () => {
        const baseURL = getDomain(apigBaseUrl);
        api.defaults.baseURL = baseURL;

        try {
            const response = await api.delete(`/${PRODUCT_COMMENT_ENDPOINT}/${commentId}`);
            console.log(response);
            setLoading(false);
        } catch (error) {
            handleError({
                error: error,
                message: "Failed to delete product!"
            });
        }
    };
}
