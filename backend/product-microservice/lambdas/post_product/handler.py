"""
Handle call which writes an item to the template DB
TODO: Error handling (either let handler function fail, or wrap?), duplicates?
The handler has the name of the table hardcoded, this is determined by the config file config/db_schema.json upon deployment
"""
import os
import boto3
import simplejson as json
from decimal import Decimal

# TODO: Remove later
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

HTTP_RESPONSE_DICT = {
    'statusCode' : '', # http status code
    'isBase64Encoded' : False, # bool
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

def handler(event: dict, context) -> dict:
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
        body : Empty, this function does not return anything except the statusCode
    """
    
    print("post_lambda invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    print("DEBUG: This is the event raw")
    print(event)
    
    TableName = "product-table"

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print("Parse body")
    try:
        item = json.loads(event['body'], parse_float=Decimal)
        print("DEBUG: This is the item")
        print(item)
    except json.decoder.JSONDecodeError as e:
        print("JSONDecodeError IN PARSING BODY")
        raise e

    print("Try writing item")
    response_put = dynamo_table.put_item(
        TableName = TableName,
        ReturnValues = "NONE",
        Item = item
    )

    print("This is the response_put object from the put_item call")
    print(response_put)
    print("This is the response_put object from the put_item call with PrettyPrinter")
    pp.pprint(response_put)

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['body'] = '' # We return the full dict from the dynamo.put_item method

    print(f"DEBUG: This is the HTTP response we are sending back")
    pp.pprint(HTTP_RESPONSE_DICT)
    
    return HTTP_RESPONSE_DICT
    
if __name__ == "__main__":
    print(handler(None, None))
