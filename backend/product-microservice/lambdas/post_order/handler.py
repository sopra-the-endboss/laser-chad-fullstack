"""
Handle call which writes an item to the template DB
TODO: Error handling (either let handler function fail, or wrap?), duplicates?
The handler has the name of the table hardcoded, this is determined by the config file config/db_schema.json upon deployment
"""
import os
import boto3
import simplejson as json
from decimal import Decimal
from botocore.exceptions import ClientError

# TODO: Remove later
from pprint import PrettyPrinter
import random
import string
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
        body : Empty, this function does not return anything except the statusCode
    """

    PATH_PARAMETER_FILTER_CART = "user_id"
    
    print("post_lambda invoked")

    print("DEBUG: This is the context")
    pp.pprint(context)

    print("DEBUG: This is the event")
    pp.pprint(event)
    
    print("DEBUG: This is the event raw")
    print(event)
    
    TableNameCart = "cart-table"

    print(f"Using table {TableNameCart}")

    print("Check if table is available ...")
    dynamo_client = boto3.client("dynamodb")
    available_tables = dynamo_client.list_tables()
    available_tables = available_tables['TableNames']
    if not TableNameCart in available_tables:
        return return_error(f"Table {TableNameCart} not found in the available tables, abort")

    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table_cart = dynamo_resource.Table(TableNameCart)

    print(f"Assure pathParameter {PATH_PARAMETER_FILTER_CART} is present in event")
    if not PATH_PARAMETER_FILTER_CART in event['pathParameters']:
        return return_error(f"pathParameter {PATH_PARAMETER_FILTER_CART} not found in event, abort")

    filter = event['pathParameters'][PATH_PARAMETER_FILTER_CART]
    print(f"This is the filter: {filter}")
    
    # There can only be one item because there is only one HASH key in the DB, the result is either a dict or not present at all
    response_get_item = dynamo_table_cart.get_item(Key = {PATH_PARAMETER_FILTER_CART:filter})
    
    # Check if we found a result, otherwise retrieve empty list
    cart_found = response_get_item.get("Item", None)

    # If None we did not found anything, return 404
    if not cart_found:
        return return_error(f"No cart with userId {filter} found", 404)

    cart_json = json.dumps(cart_found)



    # Now we have the cart, we can start to write the order

    TableNameOrder = "order-table"

    print(f"Using table {TableNameOrder}")

    print("Creating dynamo table object ...")

    dynamo_table_order = dynamo_resource.Table(TableNameOrder)

    print("Try writing item")

    # Generate a new order
    new_order = {
        'order_id': ''.join(random.choices(string.ascii_letters + string.digits, k=10)),
        'status': 'pending',
        'products': cart_json['products']
    }

    # Try to get the item from the table
    try:
        response_get = dynamo_table_order.get_item(Key={'user_id': filter})
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        item = response_get.get('Item')
        if item:
            # If the item exists, append the new order to the 'orders' list and put the item back
            item['orders'].append(new_order)
            dynamo_table_order.put_item(Item=item)
        else:
            # If the item doesn't exist, create a new item
            response_put = dynamo_table_order.put_item(
                TableName = TableNameOrder,
                ReturnValues = "NONE",
                Item = {
                    'user_id': filter,
                    'orders': [new_order]
                }
        )
            

    # Delete the item from dynamo_table_cart
    dynamo_table_cart.delete_item(Key={PATH_PARAMETER_FILTER_CART: filter})


    print("Return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = '200'
    HTTP_RESPONSE_DICT['body'] =  new_order

    print(f"DEBUG: This is the HTTP response we are sending back")
    pp.pprint(HTTP_RESPONSE_DICT)
    
    return HTTP_RESPONSE_DICT

    
    
if __name__ == "__main__":
    print(handler(None, None))
