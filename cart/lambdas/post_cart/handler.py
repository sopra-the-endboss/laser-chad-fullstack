"""
post_cart
Handle call to get a post cart with a given userId
"""

import os
import boto3
import botocore
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
        body : Empty if success

        400 if the handler can not complete
        409 if there is already a cart with userId
    """

    PATH_PARAMETER_FILTER = "userId" # Must match the name in resources_to_create.json in the path with {}
    
    print("post_cart invoked")

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    # First fetch the name of the DB table to work with
    try:
        TableName = os.environ["TableName"]
    except KeyError:
        print("env var TableName not found! This is the env. Return 400")
        print(os.environ)
        # Return 400
        HTTP_RESPONSE_DICT['statusCode'] = 400
        HTTP_RESPONSE_DICT['body'] = json.dumps("TableName not found in environment, cannot complete")
        return HTTP_RESPONSE_DICT

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

    print("Check body, should be empty")
    print(event['body'])

    # POST creates an empty array for the userId
    item_to_put = {
        "userId" : filter,
        "products" : []
    }

    # Try to put the item, but only if it not exists
    condition = "attribute_not_exists(userId)"
    try:
        response_put_item = dynamo_table.put_item(
            Item = item_to_put,
            ConditionExpression = condition,
            ReturnValues = "NONE"
        )
    except botocore.exceptions.ClientError as client_error:
        if client_error.response['Error']['Code'] == "ConditionalCheckFailedException":
            print(f"There is already an existing cart with userId {filter}, return 409")
            HTTP_RESPONSE_DICT['statusCode'] = 409
            HTTP_RESPONSE_DICT['body'] = json.dumps(f"There is already an existing cart with userId {filter}")
            return HTTP_RESPONSE_DICT
        else:
            print("Error occured during put_item operation that is not conflict")
            HTTP_RESPONSE_DICT['statusCode'] = 400
            HTTP_RESPONSE_DICT['body'] = json.dumps(client_error.response['message'])
            return HTTP_RESPONSE_DICT
    
    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['headers'] = {"Content-Type": "application/json"}
    HTTP_RESPONSE_DICT['body'] = json.dumps(item_to_put)

    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
