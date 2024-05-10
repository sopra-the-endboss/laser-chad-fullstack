"""
We do NOT test the API request model itself
The handler must assume valid data is passed from the API Gateway
We do however test statusCode in case of unexpected behavior

What we pass in the lambda handlers are event bodies
An event body is a string, which is supposed to be serializable to json

We do NOT TEST that the event contains all fields from the HTTP request from the API Gateway, we assume this is done by the API Gateway
"""

import os
import sys
import simplejson as json
import boto3
from moto import mock_aws
import pytest
from pprint import PrettyPrinter
pp = PrettyPrinter(indent = 2)

# Construct a sys path where laser-chad-fullstack is on the path
ROOT_TO_MATCH = "laser-chad-fullstack"
tmp_cwd = os.getcwd()
tmp_cwd = tmp_cwd.split(os.path.sep)
if not ROOT_TO_MATCH in tmp_cwd:
    raise ValueError(f"Could not find root {ROOT_TO_MATCH} in CWD")
path_to_append = os.path.sep.join(
    tmp_cwd[:tmp_cwd.index(ROOT_TO_MATCH)+1]
)
sys.path.insert(0,path_to_append)

###
# Lambda handlers to test
import importlib
get_handler_order = importlib.import_module("backend.product-microservice.lambdas.get_order.handler")
post_handler_order = importlib.import_module("backend.product-microservice.lambdas.post_order.handler")
put_handler_order = importlib.import_module("backend.product-microservice.lambdas.put_order.handler")

# cart handlers
import backend.cart.lambdas.get_cart.handler as get_handler_cart
import backend.cart.lambdas.post_cart.handler as post_handler_cart
import backend.cart.lambdas.put_cart_batch.handler as put_batch_handler_cart

###
# Load configs
db_config_paths = ["./backend/product-microservice/config", "./backend/cart/config"]
db_table_names = ["order-table","cart-table"]
db_schemas_to_create = {}
for db_config_path in db_config_paths:
    try:
        with open(f"{db_config_path}/db_schema.json","r") as file:
            db_schemas = json.load(file)
            for db_table_name in db_table_names:
                tmp_schema = next((db_schema for db_schema in db_schemas if db_schema['TableName'] == db_table_name), None)
                if tmp_schema is None:
                    print(f"Did not find db schema for {db_table_name} in {db_config_path}")
                else:
                    db_schemas_to_create[db_table_name] = tmp_schema
    except FileNotFoundError:
        print("Did not find json file with db config")


###
# Parameters
CONTEXT_DUMMY = None
PATHPARAMETER_NAME = "user_id" # corresponds to config, should match the resource definiton

###
# Fixtures
@mock_aws
@pytest.fixture
def set_env():
    """
    Make sure AWS environment variables are set/unset correctly before and after each test
    If AWS_ENDPOINT_URL is set, this interferes with the moto framework!
    """
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    
    if 'AWS_ENDPOINT_URL' in os.environ:
        del os.environ['AWS_ENDPOINT_URL']

@mock_aws
@pytest.fixture
def db_client(set_env):
    with mock_aws():
        yield boto3.client("dynamodb")

@mock_aws
@pytest.fixture
def dynamo_tables(db_client):
    return_tables = {}
    for db_schema in db_schemas_to_create.values():
        db_client.create_table(**db_schema)
        db_resource = boto3.resource("dynamodb")
        dynamo_table = db_resource.Table(db_schema['TableName'])
        return_tables[db_schema['TableName']] = dynamo_table
    yield return_tables

@pytest.fixture
def generate_inputs() -> dict[str,dict]:
    """
    Return a dict with
    body_description : The description of the body
    event : A dict containing the neccesary fields to simulate the handlers
        body : A JSON serialzed string passed by the API Gateway
        pathParameters : A dict with pathParameters passed by the API Gateway
    """
    
    inputs_to_return = {}
    

    ###
    # Objects we will use in the events

    # user_id
    user_id_1 = "user_id_1"

    # order_id
    order_id_1 = "order_id_1"

    # products
    product_1 = {
        "product_id":"product_id_1",
        "quantity":1
    }
    product_2 = {
        "product_id":"product_id_2",
        "quantity":2
    }

    # cart
    cart_1 = {
        "user_id":user_id_1,
        "products":[product_1,product_2]
    }

    # Cart placement via batch
    inputs_to_return["put_cart_batch"] = {
        "body" : json.dumps({
            "products":cart_1['products']
        }),
        "pathParameters" : {"user_id":cart_1['user_id']}
    }

    # order
    order_1 = {
        "user_id":user_id_1,
        "orders":[
            {
                "order_id":order_id_1,
                "status":"pending",
                "products":[product_1,product_2]
            }
        ]
    }

    ###
    # Empty body, invalid pathParameters
    inputs_to_return['pathParameter_empty'] = {
        "body" : "",
        "pathParameters" : {}
    }
    inputs_to_return['pathParameter_randomString'] = {
        "body" : "",
        "pathParameters" : {"wrongPathParameter":"wrongPathParameter"}
    }
    
    ###
    # Empty body, valid pathParameters
    inputs_to_return['pathParameter_user_id_1'] = {
        "body" : "",
        "pathParameters" : {"user_id" : user_id_1}
    }
    inputs_to_return['pathParameter_user_id_unknown'] = {
        "body" : "",
        "pathParameters" : {"user_id" : "some_unknown_user_id"}
    }
    
    ###
    # PUT ORDER valid body, valid pathParameters
    inputs_to_return['put_order'] = {
        "body" : json.dumps({
            "order_id":"irrelevant_order_id",
            "status":"some_new_status"
        }),
        "pathParameters" : {"user_id" : user_id_1}
    }
    inputs_to_return['put_order_nonexisting_order_id'] = {
        "body" : json.dumps({
            "order_id":"non_existing_order_id",
            "status":"some_new_status"
        }),
        "pathParameters" : {"user_id" : user_id_1}
    }
    



    return inputs_to_return

def test_simple_count(dynamo_tables):
    for t in dynamo_tables.values():
        item_count = t.item_count
        assert item_count == 0

@mock_aws
def test_db_does_not_exist(set_env):
    # Pass in empty arguments, we only want to test 400 if table does not exist
    dummy_event = {}
    dummy_context = {}

    res = get_handler_order.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400
    
    res = post_handler_order.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400
    
    res = put_handler_order.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400


###
# Test pathParameters
def test_GET(dynamo_tables, generate_inputs: dict[str,str]):
    """
    GET should return 200 and an empty list, even if pathParameters are wrong
    GET should return 200 if pathParameters are correct, but no items are found
    """
    
    ###
    # Assert GET with empty or wrong pathParameters returns 200 -> Empty table
    res_empty_pathParameter = get_handler_order.handler(generate_inputs['pathParameter_empty'], CONTEXT_DUMMY)
    assert res_empty_pathParameter['statusCode'] == 200
    assert res_empty_pathParameter['body'] == json.dumps([])
    
    res_wrong_pathParameter = get_handler_order.handler(generate_inputs['pathParameter_randomString'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 200
    assert res_wrong_pathParameter['body'] == json.dumps([])

    res_wrong_pathParameter = get_handler_order.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 200
    assert res_wrong_pathParameter['body'] == json.dumps([])
    
    res_wrong_pathParameter = get_handler_order.handler(generate_inputs['pathParameter_user_id_unknown'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 200
    assert res_wrong_pathParameter['body'] == json.dumps([])

def test_POST(dynamo_tables, generate_inputs: dict[str,str]):
    
    ###
    # Assert POST with empty pathParameter raises 400
    res_empty_body = post_handler_order.handler(generate_inputs['pathParameter_empty'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400
    
    ###
    # Assert POST with wrong pathParameters raises 400
    res_empty_body = post_handler_order.handler(generate_inputs['pathParameter_randomString'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400

    ###
    # Assert POST 404 if cart is not found. pathParameters are correct
    res_empty_body = post_handler_order.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 404

    # Now we put a valid cart into the cart table
    post_handler_cart.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)
    put_batch_handler_cart.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)

    ###
    # Assert POST 200 -> Create a new order item in the db, delete the cart
    # The products should be the same as in the cart
    EVENT_NAME = 'pathParameter_user_id_1'
    res = post_handler_order.handler(generate_inputs[EVENT_NAME], CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert res_body['status'] == "pending"
    assert res_body['products'] == json.loads(generate_inputs['put_cart_batch']['body'])['products']
    
    # Also assert that the cart is empty
    res_get_cart = get_handler_cart.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    res_get_cart_body = json.loads(res_get_cart['body'])
    assert res_get_cart['statusCode'] == 200
    assert res_get_cart_body['products'] == []

def test_PUT(dynamo_tables, generate_inputs: dict[str,str]):
    
    ###
    # Assert PUT with empty pathParameter raises 400
    res = put_handler_order.handler(generate_inputs['pathParameter_empty'], CONTEXT_DUMMY)
    assert res['statusCode'] == 400
    
    ###
    # Assert PUT with wrong pathParameters raises 400
    res = put_handler_order.handler(generate_inputs['pathParameter_randomString'], CONTEXT_DUMMY)
    assert res['statusCode'] == 400

    ###
    # Assert 400 if invalid body
    res = put_handler_order.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    assert res['statusCode'] == 400

    ###
    # Assert 404 if no order with order_id is found, but valid body
    res = put_handler_order.handler(generate_inputs['put_order'], CONTEXT_DUMMY)
    assert res['statusCode'] == 404

    # Then we have to create an order item. We do this by creating a cart and then creating an order
    # Save the order_id generated by post_handler_order
    post_handler_cart.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)
    put_batch_handler_cart.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)
    res_post = post_handler_order.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)
    order_id_to_check = json.loads(res_post['body'])['order_id']

    # Assert cart is empty
    res_get_cart = get_handler_cart.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    assert json.loads(res_get_cart['body'])['products'] == []
    # Assert GET order with the right user_id 200 -> Return the order item
    res_get = get_handler_order.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get['statusCode'] == 200
    assert len(res_get_body) == 1
    res_order_item = res_get_body[0]
    assert res_order_item['user_id'] == generate_inputs['pathParameter_user_id_1']['pathParameters']['user_id']
    assert len(res_order_item['orders']) == 1
    res_order = res_order_item['orders'][0]
    assert res_order['status'] == "pending"
    assert res_order['products'] == json.loads(generate_inputs['put_cart_batch']['body'])['products']

    ###
    # Assert PUT with an order_id that does not exist, but valid body, this leads to nothing being changed
    res = put_handler_order.handler(generate_inputs['put_order_nonexisting_order_id'], CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert res_body['user_id'] == generate_inputs['put_order_nonexisting_order_id']['pathParameters']['user_id']
    assert len(res_body['orders']) == 1
    res_order_item = res_body['orders'][0]
    assert res_order_item['status'] == "pending" # Status of the order has not changed
    
    ###
    # Assert PUT with an order_id that does exist and valid body -> This should change the status of the order
    # First create a new order body with the order_id of the order we created with the POST
    put_order_event = {
        "body" : json.dumps({
            "order_id":order_id_to_check,
            "status":"some_new_status"
        }),
        "pathParameters" : {
            "user_id" : generate_inputs['put_cart_batch']['pathParameters']['user_id'] 
        }
    }

    res = put_handler_order.handler(put_order_event, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert res_body['user_id'] == generate_inputs['put_order']['pathParameters']['user_id']
    assert len(res_body['orders']) == 1
    res_order_item = res_body['orders'][0]
    assert res_order_item['status'] == "some_new_status"

    # Also assert that the new status "some_new_status" is visible in the GET
    res_get = get_handler_order.handler(generate_inputs['pathParameter_user_id_1'], CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get['statusCode'] == 200
    assert len(res_get_body) == 1
    res_order_item = res_get_body[0]
    assert res_order_item['user_id'] == generate_inputs['pathParameter_user_id_1']['pathParameters']['user_id']
    assert len(res_order_item['orders']) == 1
    res_order = res_order_item['orders'][0]
    assert res_order['status'] == "some_new_status"
    


def test_POST_GET(dynamo_tables, generate_inputs: dict[str,str]):
    
    # First we put a valid cart into the cart table
    post_handler_cart.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)
    put_batch_handler_cart.handler(generate_inputs['put_cart_batch'], CONTEXT_DUMMY)

    ###
    # Assert POST 200 -> Create a new order item in the db, delete the cart
    # The products should be the same as in the cart
    EVENT_NAME = 'pathParameter_user_id_1'
    res = post_handler_order.handler(generate_inputs[EVENT_NAME], CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert res_body['status'] == "pending"
    assert res_body['products'] == json.loads(generate_inputs['put_cart_batch']['body'])['products']
    
    ###
    # Assert GET with the right user_id 200 -> Return the order item
    res_get = get_handler_order.handler(generate_inputs[EVENT_NAME], CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get['statusCode'] == 200
    assert len(res_get_body) == 1
    res_order_item = res_get_body[0]
    assert res_order_item['user_id'] == generate_inputs[EVENT_NAME]['pathParameters']['user_id']
    assert len(res_order_item['orders']) == 1
    res_order = res_order_item['orders'][0]
    assert res_order['status'] == "pending"
    assert res_order['products'] == json.loads(generate_inputs['put_cart_batch']['body'])['products']

    # Also assert that GET with a non existent user_id does not return any orders
    res_get = get_handler_order.handler(generate_inputs['pathParameter_user_id_unknown'], CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get['statusCode'] == 200
    assert res_get_body == []
