"""
Handle call to update a order with a status given a oder_id and status
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

        The body of the event is an object which must contain:
            - order_id:str
            - status:str

        NOTE: If the order_id is not found in the orders array, the function will return 200, and no status is updated
    
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
        body : JSON serialized string, object containing
            - user_id:str
            - orders:array[order]
                An order is a dict with the following required keys:
                    - order_id:str
                    - status:str
                    - products:array[str]
                    The products array can be empty

    Raises:
        400 if table not found
        400 if pathParameter user_id not found
        400 if body cannot be parsed
        400 if error updating item
        404 if no order with order_id if found order entry for user_id
    """

    PATH_PARAMETER_FILTER = "user_id" # Must match the name in resources_to_create.json in the path with {}
    
    print("put_order invoked")

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    # First fetch the name of the DB table to work with
    TableName = "order-table"

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
    pp.pprint(event['body'])

    # If we cannot parse the body, we throw a 400 error
    print("Parse body")
    try:
        body = json.loads(event['body'], parse_float=Decimal)
        print("DEBUG: This is the body")
        pp.pprint(body)
    except json.decoder.JSONDecodeError as e:
        print("JSONDecodeError IN PARSING BODY")
        return return_error("Error parsing body", 400)

    # Given the request model we can safely assume that those two fields are present
    order_id = body['order_id']
    new_status = body['status']
    
    # Now we have to check if there is a order object for filter
    # There can only be one item because there is only one HASH key in the DB, the result is either a dict or not present at all
    response_get_item = dynamo_table.get_item(Key = {PATH_PARAMETER_FILTER:filter})
    
    # Check if we found a result, otherwise retrieve empty list
    order_object_found = response_get_item.get("Item", None)

    # If None we did not find anything, return 404
    if not order_object_found:
        return return_error(f"No orders with {PATH_PARAMETER_FILTER} {filter} found, return 404", 404)

    for i, order in enumerate(order_object_found['orders']):
        if order['order_id'] == order_id:
            order_object_found['orders'][i]['status'] = new_status
            break

    # Now we have to update the item
    try:
        response = dynamo_table.put_item(
            Item = order_object_found
        )
    except Exception as e:
        return return_error(f"Error updating item: {str(e)}", 400)

    print("Success, return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(order_object_found)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))