"""
Handle call which lists all all orders for a given user
The handler has the name of the table hardcoded, this is determined by the config file config/db_schema.json upon deployment
"""
import os
import boto3
import simplejson as json
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

HTTP_RESPONSE_DICT = {
    'statusCode' : '',
    'isBase64Encoded' : False,
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
        headers : Empty by default, dict otherwise
        body : Iterable containing all orders for a given user. Can be empty
            An item in the order table dict with the following required keys:
                - user_id:str
                - orders:array[order]
                An order is a dict with the following required keys:
                    - order_id:str
                    - status:str
                    - products:array[str]
                    The products array can be empty

    Raises:
        400 if table not found
    """

    PATH_PARAMETER_FILTER = "user_id" # Must match the name in resources_to_create.json in the path with {}
    
    print("get_order invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    TableName = "order-table"

    print(f"Using table {TableName}")

    print("Check if table is available ...")
    dynamo_client = boto3.client("dynamodb")
    available_tables = dynamo_client.list_tables()
    available_tables = available_tables['TableNames']
    if not TableName in available_tables:
        print(f"Table {TableName} not found in the available tables, abort")
        HTTP_RESPONSE_DICT['statusCode'] = 400
        HTTP_RESPONSE_DICT['body'] = json.dumps(f"Table {TableName} not found in the available tables, abort")
        return HTTP_RESPONSE_DICT

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print("Scanning table, print result from scan")
    response_scan = dynamo_table.scan()
    pp.pprint(response_scan)
    print(type(response_scan))

    # Here, we have to make sure that the Items is actually something we can decode into a dict!
    
    print("Extracting items")
    # List of items, each item a dict
    found_items_list = response_scan['Items']
    print(f"Items found after scanning table:")
    pp.pprint(found_items_list)

    # Now check if we have a partParameter id which is used as a filter
    # If we have a non empty dict for event['pathParameters'] we want to apply a filter to all items found
    print(f"Filtering items with {PATH_PARAMETER_FILTER}")
    if event['pathParameters']:
        if PATH_PARAMETER_FILTER in event['pathParameters']:
            path_parameter_to_match = event['pathParameters'][PATH_PARAMETER_FILTER]
            print(f"Found path parameter {PATH_PARAMETER_FILTER}. Apply filter to all retrieved objects ...")
            found_items_filtered = [item for item in found_items_list if item[PATH_PARAMETER_FILTER] == path_parameter_to_match]
            found_items_list = found_items_filtered
            print(f"Items after filtering")
            pp.pprint(found_items_list)

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(found_items_list)

    print(f"DEBUG: This is the HTTP response we are sending back")
    pp.pprint(HTTP_RESPONSE_DICT)
    
    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
