"""
Handle call which writes an item to the template DB
Return an answer object according to put_item
If an error occurs within the handler (not wrong parameters for the lambda invocation itself), 200 is returned and an object that contains the error description
- This handler does not handle that but simply returns the object

TODO: Error handling (either let handler function fail, or wrap?), duplicates?

The handler has the name of the table hardcoded, this is determined by the config file config/db_schema.json upon deployment
"""
import os
import boto3
import json

# TODO: Remove later
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

HTTP_RESPONSE_DICT = {
    'statusCode' : '',
    'isBase64Encoded' : False,
    'headers' : {},
    # Here comes to body, as a JSON string
}

def handler(event: dict, context) -> dict:
    """
    event is a dict which contains the payload
    The API Gateway which takes the POST request is validating that all fields are present in the payload in the event body
    """
    
    print("post_lambda invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    try:
        TableName = os.environ["TableName"]
    except KeyError:
        print("env var TableName not found!")
        print(os.environ)

    print(f"Using table {TableName}")

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print("Parse body")
    try:
        item = json.loads(event['body'])
    except json.decoder.JSONDecodeError as e:
        print("JSONDecodeError IN PARSING BODY")
        print("Try to write the event object to the table")
        item = event
    
    # If an error occured in parsing the body, try to write the event object itself 

    print("Try writing item")
    response_put = dynamo_table.put_item(
        TableName = TableName,
        ReturnValues = "ALL_OLD",
        Item = item
    )

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['headers'] = {"Content-Type": "application/json"}
    HTTP_RESPONSE_DICT['body'] = json.dumps(response_put) # We return the full dict from the dynamo.put_item method

    return HTTP_RESPONSE_DICT
    

if __name__ == "__main__":
    print(handler(None, None))
