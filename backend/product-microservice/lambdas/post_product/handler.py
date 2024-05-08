"""
Post a product to the db.
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

def return_error(msg:str, code:int = 400) -> dict:
    print(msg)
    error_return_dict = HTTP_RESPONSE_DICT.copy()
    error_return_dict['statusCode']=code
    error_return_dict['body']=json.dumps(msg)
    return error_return_dict

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
        body : A JSON serialized string with an object containing one field, the product_id of the successfully inserted product

    Returns error:
        400 if the body cannot be parsed into a dict
        400 if the dynamo tables are not found
    """
    
    print("post_lambda invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
   
    TableName = "product-table"

    print("Check if table is available ...")
    dynamo_client = boto3.client("dynamodb")
    available_tables = dynamo_client.list_tables()
    available_tables = available_tables['TableNames']
    if not TableName in available_tables:
        return return_error(f"Table {TableName} not found in the available tables, abort")

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    # Since we need "product_id" to be present, we can safely assume the body is not empty
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

    print("This is the response_put object from the put_item call with PrettyPrinter")
    pp.pprint(response_put)

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] =  json.dumps(
        {'product_id': item['product_id']}
    )

    print(f"DEBUG: This is the HTTP response we are sending back")
    pp.pprint(HTTP_RESPONSE_DICT)
    
    return HTTP_RESPONSE_DICT
    
if __name__ == "__main__":
    print(handler(None, None))
