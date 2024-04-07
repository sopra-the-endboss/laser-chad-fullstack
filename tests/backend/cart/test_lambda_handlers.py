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
import backend.cart.lambdas.get_cart.handler as get_handler
import backend.cart.lambdas.post_cart.handler as post_handler
import backend.cart.lambdas.put_cart.handler as put_handler
import backend.cart.lambdas.delete_cart.handler as delete_handler

###
# Load configs
db_config_path = "./backend/cart/config"
try:
    with open(f"{db_config_path}/db_schema.json","r") as file:
        db_schemas = json.load(file)
        db_schema = db_schemas[0] # Get the first table schema
except FileNotFoundError:
    print("Did not find json file with db config")

###
# Parameters
CONTEXT_DUMMY = None
PATHPARAMETER_NAME = "userId" # corresponds to config, should match the resource definiton

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
def dynamo_table(db_client):
    db_client.create_table(**db_schema)
    db_resource = boto3.resource("dynamodb")
    dynamo_table = db_resource.Table(db_schema['TableName'])
    yield dynamo_table

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
    
    # userId
    user1_str = "user_one"
    user2_str = "user_two"
    user1_int = 1

    # prdoduct_id
    prod1 = "product_one"
    prod2 = "product_two"

    ###
    # Create events
    inputs_to_return['empty_pathParameter'] = {
        "body" : "",
        "pathParameters" : {}
    }
    
    inputs_to_return['wrong_pathParameter'] = {
        "body" : "",
        "pathParameters" : {"wrongPathParameter":"wrongPathParameter"}
    }
    
    inputs_to_return['valid_user1_prod1'] = {
        "body" : json.dumps({"product_id":prod1}),
        "pathParameters" : {"userId":user1_str}
    }
    
    inputs_to_return['valid_user1_prod2'] = {
        "body" : json.dumps({"product_id":prod2}),
        "pathParameters" : {"userId":user1_str}
    }
    
    inputs_to_return['valid_user2_prod1'] = {
        "body" : json.dumps({"product_id":prod1}),
        "pathParameters" : {"userId":user2_str}
    }
    
    inputs_to_return['valid_user2_prod2'] = {
        "body" : json.dumps({"product_id":prod2}),
        "pathParameters" : {"userId":user2_str}
    }
    


    inputs_to_return['valid_user1_int_prod1'] = {
        "body" : json.dumps({"product_id":prod1}),
        "pathParameters" : {"userId":user1_int}
    }

    inputs_to_return['valid_user1_prod1_additional_field'] = {
        "body" : json.dumps({"product_id":prod1, "additionalField":"additionalValue"}),
        "pathParameters" : {"userId":user1_str}
    }

    return inputs_to_return

def test_simple_count(dynamo_table):
    item_count = dynamo_table.item_count
    assert item_count == 0

@mock_aws
def test_db_does_not_exist(set_env):
    # Pass in empty arguments, we only want to test 400 if table does not exist
    dummy_event = {}
    dummy_context = {}

    res = get_handler.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400

def test_GET_pathParameters(dynamo_table, generate_inputs: dict[str,str]):
    ###
    # Assert GET with empty or wrong pathParameters -> 400
    res_missing_pathParameter = get_handler.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_missing_pathParameter['statusCode'] == 400
    
    res_wrong_pathParameter = get_handler.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 400

def test_POST_pathParameters(dynamo_table, generate_inputs: dict[str,str]):
    ###
    # Assert POST with empty or wrong pathParameters -> 400
    res_missing_pathParameter = post_handler.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_missing_pathParameter['statusCode'] == 400
    
    res_wrong_pathParameter = post_handler.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 400

def test_PUT_pathParameters(dynamo_table, generate_inputs: dict[str,str]):
    ###
    # Assert POST with empty or wrong pathParameters -> 400
    res_missing_pathParameter = put_handler.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_missing_pathParameter['statusCode'] == 400
    
    res_wrong_pathParameter = put_handler.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 400

def test_DELETE_pathParameters(dynamo_table, generate_inputs: dict[str,str]):
    ###
    # Assert POST with empty or wrong pathParameters -> 400
    res_missing_pathParameter = delete_handler.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_missing_pathParameter['statusCode'] == 400
    
    res_wrong_pathParameter = delete_handler.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 400
    
def test_POST_create(dynamo_table, generate_inputs: dict[str,str]):
    
    ###
    # Assert POST works with a string userId
    assert post_handler.handler(generate_inputs['valid_user1_prod1'], CONTEXT_DUMMY)['statusCode'] == 200
    
    ###
    # Assert POST does not work with an integer userId
    assert post_handler.handler(generate_inputs['valid_user1_int_prod1'], CONTEXT_DUMMY)['statusCode'] == 400

def test_POST_duplication_error(dynamo_table, generate_inputs: dict[str,str]):
    
    ###
    # Put one valid entry
    assert post_handler.handler(generate_inputs['valid_user1_prod1'], CONTEXT_DUMMY)['statusCode'] == 200
    
    # Try to put the same userId -> 409
    assert post_handler.handler(generate_inputs['valid_user1_prod1'], CONTEXT_DUMMY)['statusCode'] == 409

def test_POST_body_not_empty(dynamo_table, generate_inputs: dict[str,str]):
    
    ###
    # A non-empty body should not prevent success, is ignored
    assert post_handler.handler(generate_inputs['valid_user1_prod1_additional_field'], CONTEXT_DUMMY)['statusCode'] == 200
    
    # Make sure the input was written by checking duplication error
    assert post_handler.handler(generate_inputs['valid_user1_prod1'], CONTEXT_DUMMY)['statusCode'] == 409

def test_GET(dynamo_table, generate_inputs: dict[str,str]):

    EVENT_NAME = 'valid_user1_prod1'
    EVENT = generate_inputs[EVENT_NAME]
    
    ###
    # Assert GET on empty table returns 404, userId not found
    assert get_handler.handler(EVENT, CONTEXT_DUMMY)['statusCode'] == 404

    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    # Assert GET -> 200
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200

    # Assert that the answer of the GET is exactly what we expect
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : []
    }
    assert json.loads(res_get['body']) == BODY_EXPECT

def test_PUT_once(dynamo_table, generate_inputs: dict[str,str]):

    ###
    # Assert 404 if userId does not have a cart
    EVENT_NAME = 'valid_user1_prod1'
    EVENT = generate_inputs[EVENT_NAME]
    
    ###
    # Assert PUT on empty table returns 404, userId not found
    assert put_handler.handler(EVENT, CONTEXT_DUMMY)['statusCode'] == 404

    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    # PUT valid, this creates an entry for the product_id
    res_put = put_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200

    res_body = json.loads(res_put['body'])
    
    # Assert that the qty is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT['body'])['product_id'], "qty":1}]
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_PUT_multi_same_prod(dynamo_table, generate_inputs: dict[str,str]):

    ###
    # Assert 404 if userId does not have a cart
    EVENT_NAME = 'valid_user1_prod1'
    EVENT = generate_inputs[EVENT_NAME]
    
    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    # PUT valid, this creates an entry for the product_id with qty 1
    res_put = put_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the qty is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT['body'])['product_id'], "qty":1}]
    }
    assert res_body == BODY_EXPECT

    # Also assert that the result has exactly one product for the userId
    assert len(res_body['products']) == 1

    # PUT valid the same item, should increase qty to 2
    res_put = put_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the qty is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT['body'])['product_id'], "qty":2}]
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_PUT_multi_prod(dynamo_table, generate_inputs: dict[str,str]):

    EVENT_NAME_1 = 'valid_user1_prod1'
    EVENT_NAME_2 = 'valid_user1_prod2'
    
    EVENT_1 = generate_inputs[EVENT_NAME_1]
    EVENT_2 = generate_inputs[EVENT_NAME_2]
    
    # POST valid, this creates for userId a cart entry for two users
    post_handler.handler(EVENT_1, CONTEXT_DUMMY)

    # PUT valid, this creates an entry for user1 for the product_id prod1 with qty 1
    res_put = put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # PUT valid the same item, should increase prod1 qty to 2
    res_put = put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # PUT valid for user1, but different product, should increase qty for prod2 to 1
    res_put = put_handler.handler(EVENT_2, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])

    # Assert that user1 has two products, prod1 with qty 2 and prod2 with qty 1
    BODY_EXPECT = {
        "userId" : EVENT_1['pathParameters']['userId'],
        "products" : [
            {"product_id" : json.loads(EVENT_1['body'])['product_id'], "qty":2},
            {"product_id" : json.loads(EVENT_2['body'])['product_id'], "qty":1}
        ]
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT_1, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_DELETE_once(dynamo_table, generate_inputs: dict[str,str]):

    ###
    # Assert 404 if userId does not have a cart
    EVENT_NAME = 'valid_user1_prod1'
    EVENT = generate_inputs[EVENT_NAME]
    
    ###
    # Assert DELETE on empty table returns 404, userId not found
    assert delete_handler.handler(EVENT, CONTEXT_DUMMY)['statusCode'] == 404

    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    # PUT valid, this creates an entry for the product_id
    assert put_handler.handler(EVENT, CONTEXT_DUMMY)['statusCode'] == 200
    
    res_delete = delete_handler.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res_delete['body'])

    # DELETE valid, this should remove the entry and leave an empty products list
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : []
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_DELETE_empty(dynamo_table, generate_inputs: dict[str,str]):

    ###
    # Assert that deleting a nonexistent product_id is a success
    
    EVENT_NAME = 'valid_user1_prod1'
    EVENT = generate_inputs[EVENT_NAME]
    
    ###
    # Assert DELETE on empty table returns 404, userId not found
    assert delete_handler.handler(EVENT, CONTEXT_DUMMY)['statusCode'] == 404

    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    res_delete = delete_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_delete['statusCode'] == 200
    res_body = json.loads(res_delete['body'])

    # DELETE valid, this should just return an empty list
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : []
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_DELETE_multi(dynamo_table, generate_inputs: dict[str,str]):

    EVENT_NAME_1 = 'valid_user1_prod1'
    EVENT_NAME_2 = 'valid_user1_prod2'
    EVENT_NAME_3 = 'valid_user2_prod1'
    
    EVENT_1 = generate_inputs[EVENT_NAME_1]
    EVENT_2 = generate_inputs[EVENT_NAME_2]
    EVENT_3 = generate_inputs[EVENT_NAME_3]
    
    # POST valid, this creates for userId a cart entry, multiple userId
    post_handler.handler(EVENT_1, CONTEXT_DUMMY)
    post_handler.handler(EVENT_3, CONTEXT_DUMMY)

    # PUT valid, this creates multiple entries
    # user1 prod1 - qty 2
    # user1 prod2 - qty 1
    # user2 prod1 - qty 3
    put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    put_handler.handler(EVENT_2, CONTEXT_DUMMY)
    put_handler.handler(EVENT_3, CONTEXT_DUMMY)
    put_handler.handler(EVENT_3, CONTEXT_DUMMY)
    put_handler.handler(EVENT_3, CONTEXT_DUMMY)
    
    # DELETE, should result in
    # user1 prod1 - qty 1
    # user2 prod1 - qty 2
    delete_handler.handler(EVENT_1, CONTEXT_DUMMY)
    delete_handler.handler(EVENT_2, CONTEXT_DUMMY)
    delete_handler.handler(EVENT_3, CONTEXT_DUMMY)

    USER1_EXPECT = {
        "userId" : EVENT_1['pathParameters']['userId'],
        "products" : [
            {"product_id" : "product_one", "qty" : 1}
        ]
    }
    
    USER2_EXPECT = {
        "userId" : EVENT_3['pathParameters']['userId'],
        "products" : [
            {"product_id" : "product_one", "qty" : 2}
        ]
    }
    
    # Verify that GET returns the expected information
    res_get = get_handler.handler(EVENT_1, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == USER1_EXPECT
    
    res_get = get_handler.handler(EVENT_3, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == USER2_EXPECT

