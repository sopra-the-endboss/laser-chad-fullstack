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
    'headers' : {}, # Default is no headers
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
        headers : Empty by default, dict otherwise
        body : JSON serialized List object with all the carts found. Each cart is a ???
    """

    PATH_PARAMETER_FILTER = "userId" # Must match the name in resources_to_create.json in the path with {}
    
    print("get_cart invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    # First fetch the name of the DB table to work with
    try:
        TableName = os.environ["TableName"]
    except KeyError:
        print("env var TableName not found!")
        print(os.environ)
        # Return 400
        HTTP_RESPONSE_DICT['statusCode'] = 400
        HTTP_RESPONSE_DICT['body'] = json.dumps("TableName not found in environment, cannot complete")
        return HTTP_RESPONSE_DICT

    print(f"Using table {TableName}")

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print("Scanning table, print result from scan, raw and PrettyPrinted")
    # TODO: Check other options like .query

    print("UNDER CONSTRUCTION; ABORT HERE")
    raise NotImplementedError

    response_scan = dynamo_table.scan()
    print(response_scan)
    pp.pprint(response_scan)
    print(type(response_scan))

    # Here, we have to make sure that the Items is actually something we can decode into a dict!
    
    print("Extracting items")
    # List of items, each item a dict
    found_items_list = response_scan['Items']
    print(f"Items found after scanning table:")
    print(found_items_list)

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
            print(found_items_list)

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['headers'] = {"Content-Type": "application/json"}
    HTTP_RESPONSE_DICT['body'] = json.dumps(found_items_list)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
