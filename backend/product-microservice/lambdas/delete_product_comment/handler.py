"""
delete_product
Handle call to decrease/delete a product with a product_id and quantity for a given userId
"""

from decimal import Decimal
import boto3
import simplejson as json
from pprint import PrettyPrinter
from botocore.exceptions import ClientError
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

    Returns error:
        400 if the body cannot be parsed into a dict
        400 if the dynamo tables are not found
        400 if the pathParameter 'product_id' is not present in the event
        401 if a user tries to delete a review that is not theirs, if user_id and review_id do not match
        404 if the product_id is not found in the table
        404 if the review_id is not found in the table
    """

    PATH_PARAMETER_FILTER = "product_id" # Must match the name in resources_to_create.json

    print("delete_product invoked")

    print("DEBUG: This is the event")
    pp.pprint(event)

    TableName = "product-comment-table"

    print(f"Using table {TableName}")

    print("Check if table is available ...")
    dynamo_client = boto3.client("dynamodb")
    available_tables = dynamo_client.list_tables()
    available_tables = available_tables['TableNames']
    if not TableName in available_tables:
        return return_error(f"Table {TableName} not found in the available tables, abort", 400)


    print("Creating dynamo table object ...")
    dynamo_resource = boto3.resource("dynamodb")
    dynamo_table = dynamo_resource.Table('product-comment-table')
    
    print(f"Assure pathParameter {PATH_PARAMETER_FILTER} is present in event")
    if not PATH_PARAMETER_FILTER in event['pathParameters']:
        return return_error(f"pathParameter {PATH_PARAMETER_FILTER} not found in event, abort")
        
    filter = event['pathParameters'][PATH_PARAMETER_FILTER]
    print(f"This is the filter: {filter}")


    print(f"Assure pathParameter {PATH_PARAMETER_FILTER} is present in event")
    if not PATH_PARAMETER_FILTER in event['pathParameters']:
        return return_error(f"pathParameter {PATH_PARAMETER_FILTER} not found in event, abort")

    filter = event['pathParameters'][PATH_PARAMETER_FILTER]
    print(f"This is the filter: {filter}")
    

    print("Parse body")
    try:
        body = json.loads(event['body'], parse_float=Decimal)
        print("DEBUG: This is the body")
        pp.pprint(body)
    except json.decoder.JSONDecodeError as e:
        print("JSONDecodeError IN PARSING BODY")
        return return_error("Error parsing body", 400)
    
    # Given our data models, we can safely assume the following structure
    review_id = body['review_id']
    user_id = body['user_id']

    # Try to get the item from the table
    try:
        response_get = dynamo_table.get_item(Key={'product_id': filter})
    except ClientError as e:
        return return_error(e.response['Error']['Message'], 400)
    else:
        item = response_get.get('Item')
        if item:
            review_found = False  # Add a flag to track if the review was found
            for i, review in enumerate(item['reviews']):
                if review['review_id'] == review_id:
                    if review['user_id'] != user_id:
                        return return_error(f"User with user_id {user_id} not authorized to delete review with review_id {review_id}", 401)
                    
                    del item['reviews'][i]
                    review_found = True  # Set the flag to True if the review was found and deleted

                    # Now we have to update the item
                    try:
                        response = dynamo_table.put_item(
                            Item = item
                        )
                    except Exception as e:
                        return return_error(f"Error updating item in table afer removing found review: {str(e)}")

                    break
            if not review_found:  # Only return the error if the review was not found
                return return_error(f"Review with review_id {review_id} not found in table, abort", 404)
        else:
            return return_error(f"Product with product_id {filter} not found in table, abort", 404)

    response_get = dynamo_table.get_item(Key={'product_id': filter})
    item = response_get.get('Item')


    print("Success, return HTTP object")
    HTTP_RESPONSE_DICT['statusCode'] = 200
    HTTP_RESPONSE_DICT['body'] = json.dumps(item)
    return HTTP_RESPONSE_DICT

if __name__ == "__main__":
    print(handler(None, None))
