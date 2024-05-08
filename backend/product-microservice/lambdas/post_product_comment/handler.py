"""
Handle call which writes a new product comment to the database
The handler has the name of the table hardcoded, this is determined by the config file config/db_schema.json upon deployment
"""
import os
import random
import string
import boto3
import simplejson as json
from decimal import Decimal
from botocore.exceptions import ClientError

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
        body : Returns the full DB entry with the added review consisting of
            product_id:str
            reviews:array[str]

    Returns error:
        400 if the body cannot be parsed into a dict
        400 if the dynamo tables are not found
        400 if the pathParameter 'product_id' is not present in the event
    """

    PATH_PARAMETER_FILTER = "product_id" # Must match the name in resources_to_create.json in the path with {}
    
    print("post_lambda invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    TableName = "product-comment-table"

    print("Check if table is available ...")
    dynamo_client = boto3.client("dynamodb")
    available_tables = dynamo_client.list_tables()
    available_tables = available_tables['TableNames']
    if not TableName in available_tables:
        return return_error(f"Table {TableName} not found in the available tables, abort", 400)

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table(TableName)

    print(f"Assure pathParameter product_id is present in event")
    if not PATH_PARAMETER_FILTER in event['pathParameters']:
        return return_error(f"pathParameter {PATH_PARAMETER_FILTER} not found in event, abort", 400)

    filter = event['pathParameters'][PATH_PARAMETER_FILTER]
    print(f"This is the filter: {filter}")

    # We can safely assume the filter to be a string, as it is part of the URL

    # If we cannot parse the body, we throw a 400 error
    print("Parse body")
    try:
        new_item = json.loads(event['body'], parse_float=Decimal)
        print("DEBUG: This is the item")
        print(new_item)
    except json.decoder.JSONDecodeError as e:
        print("JSONDecodeError IN PARSING BODY")
        return return_error("Error parsing body", 400)
    
    new_review = {
        'user': new_item['user'],
        'user_id': new_item['user_id'],
        'rating': new_item['rating'],
        'review': new_item['review'],
        'title' : new_item['title'],
        'date' : new_item['date'],
        'review_id': new_item['review_id']
    }
    
    # Try to get the item from the table
    try:
        response_get = dynamo_table.get_item(Key={'product_id': filter})
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        item = response_get.get('Item')
        if item:
            print("DEBUG: Item exists")
            pp.pprint(item)
            # If the item exists, append the new order to the 'orders' list and put the item back
            item['reviews'].append(new_review)
            print("DEBUG: This is the item after appending the new review")
            pp.pprint(item)
            _ = dynamo_table.put_item(
                TableName = TableName,
                ReturnValues = "NONE",
                Item=item
            )
        else:
            # If the item doesn't exist, create a new item
            print("DEBUG: Item does not exist, create anew")
            
            item = {
                'product_id': filter,
                'reviews': [new_review]
            }
            print("DEBUG: This is the new item we will put")
            pp.pprint(item)

        _ = dynamo_table.put_item(
            TableName = TableName,
            ReturnValues = "NONE",
            Item = item
        )

    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(item)

    print(f"DEBUG: This is the HTTP response we are sending back")
    pp.pprint(HTTP_RESPONSE_DICT)
    
    return HTTP_RESPONSE_DICT
    
if __name__ == "__main__":
    print(handler(None, None))
