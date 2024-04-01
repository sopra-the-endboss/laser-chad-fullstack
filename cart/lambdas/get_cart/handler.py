"""
get_cart
Handle call to get a cart with a given userId
"""

import os
import boto3
import simplejson as json
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

HTTP_RESPONSE_DICT = {
    'statusCode' : '200', # Default is 200
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
        body : JSON serialized dict object with the carts found.

        400 if the handler can not complete
        404 if there is no cart with userId
    """

    PATH_PARAMETER_FILTER = "userId" # Must match the name in resources_to_create.json in the path with {}
    
    print("get_cart invoked")

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    # First fetch the name of the DB table to work with
    TableName = "cart-table"

    print(f"Using table {TableName}")

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print(f"Assure pathParameter {PATH_PARAMETER_FILTER} is present in event")
    if not event['pathParameters'][PATH_PARAMETER_FILTER]:
        print(f"pathParameter {PATH_PARAMETER_FILTER} not found in event, abort")
        HTTP_RESPONSE_DICT['statusCode'] = 400
        HTTP_RESPONSE_DICT['body'] = json.dumps(f"pathParameter {PATH_PARAMETER_FILTER} not found, cannot complete")
        return HTTP_RESPONSE_DICT

    filter = event['pathParameters'][PATH_PARAMETER_FILTER]
    print(f"This is the filter: {filter}")
    
    # There can only be one item because there is only one HASH key in the DB, the result is either a dict or not present at all
    response_get_item = dynamo_table.get_item(Key = {PATH_PARAMETER_FILTER:filter})
    
    # Check if we found a result, otherwise retrieve empty list
    cart_found = response_get_item.get("Item", None)

    # If None we did not found anything, return 404
    if not cart_found:
        print(f"No cart with userId {filter} found, return 404")
        HTTP_RESPONSE_DICT['statusCode'] = 404
        HTTP_RESPONSE_DICT['body'] = json.dumps(f"No cart with userId {filter} found")
        return HTTP_RESPONSE_DICT

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['body'] = json.dumps(cart_found)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
