"""
delete_product
Handle call to decrease/delete a product with a product_id and quantity for a given userId
"""

import boto3
import simplejson as json
from pprint import PrettyPrinter
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
    
    Returns:
        A valid HTTP Response dict which must contain the fields
        - statusCode
        - isBase64Encoded
        - headers
        - body
        If headers are written, they must be a dict
        The body must be a JSON serializable string, handeled by json.dumps()

        statusCode : 200 if success, 4XX otherwise
        isBase64Encoded : False by default1
        headers : Default to allow CORS, otherwise not used
        body : JSON serialized new product

        400 if the handler can not complete
        404 if there is no product with product_id
    """

    PATH_PARAMETER_FILTER = "product_id" # Must match the name in resources_to_create.json in the path with {}
    PRODUCT_DELETED = False

    print("delete_product invoked")

    print("DEBUG: This is the event")
    pp.pprint(event)
    

        
    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table_product = dynamo_resource.Table('product-table')
    dynamo_table_product_comment = dynamo_resource.Table('product-comment-table')
    dynamo_table_product_detail = dynamo_resource.Table('product-detail-table')

    print(f"Assure pathParameter {PATH_PARAMETER_FILTER} is present in event")
    if not PATH_PARAMETER_FILTER in event['pathParameters']:
        return return_error(f"pathParameter {PATH_PARAMETER_FILTER} not found in event, abort")
        
    filter = event['pathParameters'][PATH_PARAMETER_FILTER]
    print(f"This is the filter: {filter}")


    ###
    # Check the body item to update
    print("Check body, should be a dict or something serializable into a dict")
    print(event['body'])



    print(f"Filtering items with {PATH_PARAMETER_FILTER}")
    if event['pathParameters']:
        if PATH_PARAMETER_FILTER in event['pathParameters']:
            product_id_to_delete = event['pathParameters'][PATH_PARAMETER_FILTER]


    print("This is the value extracted from the products field in the body")
    print(product_id_to_delete)
    

    for dynamo_table in [dynamo_table_product, dynamo_table_product_comment, dynamo_table_product_detail]:
        ###
        # Now we have to check if there is a product for filter
        # There can only be one item because there is only one HASH key in the DB, the result is either a dict or not present at all
        response_get_item = dynamo_table.get_item(Key = {PATH_PARAMETER_FILTER:filter})
        
        # Check if we found a result, otherwise retrieve empty list
        product_found = response_get_item.get("Item", None)

        # If None we did not found anything, return 404
        if not product_found:
            print(f"Product with product_id {filter} not found in table {dynamo_table.name}")
        
        # Delete the product from the DynamoDB table
        dynamo_table.delete_item(Key={'product_id': product_id_to_delete})


    
    print("Success, return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = "Deleted product with product_id {product_id_to_delete}"
    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
