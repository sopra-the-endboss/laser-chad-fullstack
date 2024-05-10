"""
put_cart_batch
Handle call to update a cart for a user_id with an arbitrary array of objects whit at least product_id and quantity
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

    The body can be parsed to a dict and contains at least the field products
    products is an array of min length 0, if not empty containing two fields product_id:str and quantity:int
    
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
        body : JSON serialized new cart entry

    Returns error:
        400 if the table does not exist or the pathParameter is not present in the event or invalid
        404 if there is no cart with user_id

    """

    PATH_PARAMETER_FILTER = "user_id" # Must match the name in resources_to_create.json in the path with {}
    
    print("put_cart_batch invoked")

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
    print("Check body, should be a list of json serializable objects")
    pp.pprint(event['body'])

    # serialize json string into dict
    body = json.loads(event['body'], parse_float=Decimal)

    # If there are any other fields than products, they will be ignored

    # Due to the check on the request, we can safely assume the key 'products' is in the body
    products_to_update = body['products']
    print("This is the new cart which will be placed if user exists")
    pp.pprint(products_to_update)

    ###
    # Now we have to check if there is a cart for filter
    # There can only be one item because there is only one HASH key in the DB, the result is either a dict or not present at all
    response_get_item = dynamo_table.get_item(Key = {PATH_PARAMETER_FILTER:filter})
    
    # Check if we found a result, otherwise retrieve empty list
    cart_found = response_get_item.get("Item", None)

    # If None we did not find anything, return 404
    if not cart_found:
        return return_error(f"No cart with {PATH_PARAMETER_FILTER} {filter} found, return 404", 404)
    
    # If we found an existing cart, fetch it to print it
    # pop returns the old products
    cart_updated = cart_found.copy()
    products_to_replace = cart_updated.pop('products')
    print(f"Found cart, this will be replaced")
    pp.pprint(products_to_replace)

    # Then replace the entry with the new body
    cart_updated["products"] = products_to_update

    # Add the updated cart to the DB, overwrite with key filter
    _ = dynamo_table.put_item(
        Item = cart_updated,
        ReturnValues = "NONE"
    )

    # Return the updated cart
    print("Success, return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(cart_updated)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
