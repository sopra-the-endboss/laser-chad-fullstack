import {useEffect} from "react";
import {useSelector} from "react-redux";

const MyShop = () => {

    //verify that user is logged in
    const userGroups = useSelector(state => state.auth.groups);

    // Check if the user is part of the 'seller' group
    const isSeller = userGroups?.includes('seller');

    // list all products, together with the edit / delete option

    useEffect(() => {
        //myshop is similar to allProductDetailsMock without the technical details.
    }, []);

    return (
        <div>
            {isSeller ? (
                <p>The user is a seller.</p>
            ) : (
                <p>The user is not a seller, or not logged in.</p>
            )}
        </div>
    );
}; export default MyShop;