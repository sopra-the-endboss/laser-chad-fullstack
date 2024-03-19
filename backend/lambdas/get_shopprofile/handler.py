"""
Handle call which lists all shopprofiles or a single shopprofile with a path variable shopemail
Returns a HTTP Response object, otherwise cannot work with API Gateway
Returns an empty body if no item which matches shopemail is found

The handler has the name of the table hardcoded, this is determined by the config file config/db_schema.json upon deployment
"""
import os
import boto3
import json
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

HTTP_RESPONSE_DICT = {
    'statusCode' : '',
    'isBase64Encoded' : False,
    'headers' : {},
    # Here comes to body, as a JSON string
}

def handler(event, context) -> list[dict]:

    PATH_PARAMETER_FILTER = "shopemail"
    
    print("list_shopprofiles invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)

    try:
        TableName = os.environ["TableName"]
    except KeyError:
        print("env var TableName not found!")
        print(os.environ)
        # TODO: In this case, return 4XX response

    print(f"Using table {TableName}")

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print("Scanning table")
    response_scan = dynamo_table.scan(TableName = "shopprofiles")
    print(type(response_scan))
    pp.pprint(response_scan)
    
    print("Extracting items")
    # List of items, each item a dict
    found_items_list = response_scan['Items']
    print(f"Items found after scanning table: {json.dumps(found_items_list)}")

    # Now check if we have a partParameter shopemail which is used as a filter
    # If we have a non empty dict for event['pathParameters'] we have
    if event['pathParameters']:
        if PATH_PARAMETER_FILTER in event['pathParameters']:
            path_parameter_to_match = event['pathParameters'][PATH_PARAMETER_FILTER]
            print(f"Found path parameter {PATH_PARAMETER_FILTER}. Apply filter to all retrieved objects ...")
            found_items_filtered = [item for item in found_items_list if item[PATH_PARAMETER_FILTER] == path_parameter_to_match]
            found_items_list = found_items_filtered
            print(f"Items after filtering: {json.dumps(found_items_filtered)}")

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['headers'] = {"Content-Type": "application/json"}
    HTTP_RESPONSE_DICT['body'] = json.dumps(found_items_list)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
