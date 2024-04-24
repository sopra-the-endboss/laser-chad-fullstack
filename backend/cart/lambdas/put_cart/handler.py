"""
put_cart
Handle call to update a cart with a product_id and quantity for a given userId
TODO: Allow for arbitrary additional fields with product_id
"""

import boto3
import simplejson as json
from pprint import PrettyPrinter
from decimal import Decimal
pp = PrettyPrinter(indent=2)

HTTP_RESPONSE_DICT = {
    'statusCode' : 200, # Default is 200
    'isBase64Encoded' : False, # Default is False
    # To allow CORS requests from the frontend, we have to set the appropirate headers
    # https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html
    # API Gateway Proxy Lambda integration
    'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Content-Type': 'application/json'
        }
    # Here comes to body, as a JSON string
}

def return_error(msg:str, code:int = 400) -> dict:
    print(msg)
    error_return_dict = HTTP_RESPONSE_DICT.copy()
    error_return_dict['statusCode']=code
    error_return_dict['body']=json.dumps(msg)
    return error_return_dict

def handler(event, context) -> list[dict]:
    """
    Arguments:
        event : a dict which contains all data from the request to the API
        context : a LambdaContext object
    
    Returns:
        A valid HTTP Response dict which must contain the fields
        - statusCode
        - isBase64Encoded
        - headers
        - body
        If headers are written, they must be a dict
        The body must be a JSON serializable string, handeled by json.dumps()

        statusCode : 200 if success, 4XX otherwise
        isBase64Encoded : False by default
        headers : Default to allow CORS, otherwise not used
        body : JSON serialized new cart

        400 if the handler can not complete
        404 if there is no cart with userId
    """

    PATH_PARAMETER_FILTER = "userId" # Must match the name in resources_to_create.json in the path with {}
    
    print("put_cart invoked")

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    # First fetch the name of the DB table to work with
    TableName = "cart-table"

    print(f"Using table {TableName}")

    print("Check if table is available ...")
    dynamo_client = boto3.client("dynamodb")
    available_tables = dynamo_client.list_tables()
    available_tables = available_tables['TableNames']
    if not TableName in available_tables:
        return return_error(f"Table {TableName} not found in the available tables, abort")
        
    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print(f"Assure pathParameter {PATH_PARAMETER_FILTER} is present in event")
    if not PATH_PARAMETER_FILTER in event['pathParameters']:
        return return_error(f"pathParameter {PATH_PARAMETER_FILTER} not found in event, abort")
        
    filter = event['pathParameters'][PATH_PARAMETER_FILTER]
    print(f"This is the filter: {filter}")


    ###
    # Check the body item to update
    print("Check body, should be a dict or something serializable into a dict")
    print(event['body'])

    # serialize json string into dict
    body = json.loads(event['body'], parse_float=Decimal)

    # Due to the check on the request, we can safely assume the key 'product_id' is in the body and its only one
    product_id_to_update = body['product_id']

    # Check if there are other fields in the body apart from product_id and quantity
    # get a dict without product_id and quantity
    product_id_additional_fields_to_update = {k:body[k] for k in body if k not in ("product_id","quantity")}
    if product_id_additional_fields_to_update:
        print(f"Found additionalfields {product_id_additional_fields_to_update}, those will be updated")

    print("This is the value extracted from the product_id field in the body")
    print(product_id_to_update)
    

    ###
    # Now we have to check if there is a cart for filter
    # There can only be one item because there is only one HASH key in the DB, the result is either a dict or not present at all
    response_get_item = dynamo_table.get_item(Key = {PATH_PARAMETER_FILTER:filter})
    
    # Check if we found a result, otherwise retrieve empty list
    cart_found = response_get_item.get("Item", None)

    # If None we did not find anything, return 404
    if not cart_found:
        return return_error(f"No cart with userId {filter} found, return 404", 404)

    ###
    # Now either product_id_to_update is in the cart, then we increase quantity by 1
    # OR if product_id_to_update not in cart, we add it with quantity 1
    print("this is the cart_found")
    print(type(cart_found))
    print(cart_found)

    # Cart could be empty, then products is still a list
    products_found = cart_found['products']
    product_ids_found = [p['product_id'] for p in products_found]
    product_quantitys_found = [p['quantity'] for p in products_found]

    print("this is the products found, and the product_ids and the quantitys")
    print(products_found)
    print(product_ids_found)
    print(product_quantitys_found)

    # Assert that there are no duplicated product_id in a cart
    if len(product_ids_found) != len(set(product_ids_found)):
        print("product_ids_found contains duplicates, abort")
        raise ValueError("product_ids_found contains duplicates, abort")
    
    # Assert that there are no non-positive quantity in a cart
    if any(quantity <= 0 for quantity in product_quantitys_found):
        print("product_quantitys_found contains non-positive quantities, abort")
        raise ValueError("product_quantitys_found contains non-positive quantities, abort")
    
    # Search for product_id_to_update, check if it is present, if not create a new one
    product_id_to_update_found = product_id_to_update in product_ids_found
    # If it is not present, create new product with quantity 0
    if not product_id_to_update_found:
        print(f"product_id {product_id_to_update} to put not found, create it")
        product_updated = {"product_id":product_id_to_update, "quantity":0}
    else:
        print(f"product_id {product_id_to_update} is already present in cart, pop it")
        # If it is present remove the old product from products_found, replace it with a new one
        index_product_id_to_update = product_ids_found.index(product_id_to_update)
        product_updated = products_found.pop(index_product_id_to_update)
    
    # increase quantity
    product_updated['quantity'] += 1

    # Now merge any additional fields, overwrite already existing fields
    product_updated = {**product_updated, **product_id_additional_fields_to_update}

    print("This is the product_updated after increasing")
    print(product_updated)

    print("this is the not yet updated product list")
    print(products_found)

    print("this is the new product we will put")
    print(product_updated)

    # Add the new updated product to the products found list
    products_found.append(product_updated)

    print("this is the updated product list")
    print(products_found)

    # Add the updated cart to the DB, overwrite with key filter
    _ = dynamo_table.put_item(
        Item = cart_found,
        ReturnValues = "NONE"
    )
    
    print("Success, return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(cart_found)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
