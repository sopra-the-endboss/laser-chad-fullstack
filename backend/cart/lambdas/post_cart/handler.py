"""
post_cart
Handle call to get a post cart with a given user_id
"""

import boto3
import botocore
import simplejson as json
from pprint import PrettyPrinter
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

    For the given user_id, a new cart is created with an empty list of products.
    
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
        body : The object written
    
    Returns error:
        400 if table not found
        400 if pathParameter not found or invalid
        409 if there is already a cart with user_id
        400 if the put operation failed
    """

    PATH_PARAMETER_FILTER = "user_id" # Must match the name in resources_to_create.json in the path with {}
    
    print("post_cart invoked")

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

    print("Check body, should be empty")
    pp.pprint(event['body'])

    # POST creates an empty array for the user_id
    item_to_put = {
        "user_id" : filter,
        "products" : []
    }

    # Try to put the item, but only if it not exists
    condition = "attribute_not_exists(user_id)"
    try:
        response_put_item = dynamo_table.put_item(
            Item = item_to_put,
            ConditionExpression = condition,
            ReturnValues = "NONE"
        )
    except botocore.exceptions.ClientError as client_error:
        if client_error.response['Error']['Code'] == "ConditionalCheckFailedException":
            return return_error(f"There is already an existing cart with user_id {filter}, return 409", 409)
        else:
            return return_error("Error occured during put_item operation that is not conflict")
    
    print("Success, return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(item_to_put)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
