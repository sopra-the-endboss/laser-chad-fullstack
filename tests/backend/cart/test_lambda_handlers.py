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
import backend.cart.lambdas.put_cart_batch.handler as put_batch_handler

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

    # additional fields
    brand1 = "apple"
    brand2 = "intel"
    image1 = "image_one"
    title1 = "title_two"

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
    
    inputs_to_return['valid_user1_prod1_addfield1'] = {
        "body" : json.dumps({
            "product_id":prod1,
            "brand":brand1,
            "image":image1}
            ),
        "pathParameters" : {"userId":user1_str}
    }
    
    inputs_to_return['valid_user1_prod1_addfield2'] = {
        "body" : json.dumps({
            "product_id":prod1,
            "brand":brand2,
            "title":title1}
            ),
        "pathParameters" : {"userId":user1_str}
    }
    
    inputs_to_return['valid_user1_prod1_addfield_quantity'] = {
        "body" : json.dumps({
            "product_id":prod1,
            "brand":brand1,
            "quantity":99}
            ),
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


###
# Test pathParameters
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


###
# Test POST
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


###
# Test GET empty
def test_GET_empty(dynamo_table, generate_inputs: dict[str,str]):

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


###
# Test PUT and DELETE with only minimal fields product_id
# For DELETE, use additional fields, those should not alter the functionality
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
    
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT['body'])['product_id'], "quantity":1}]
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

    # PUT valid, this creates an entry for the product_id with quantity 1
    res_put = put_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT['body'])['product_id'], "quantity":1}]
    }
    assert res_body == BODY_EXPECT

    # Also assert that the result has exactly one product for the userId
    assert len(res_body['products']) == 1

    # PUT valid the same item, should increase quantity to 2
    res_put = put_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT['body'])['product_id'], "quantity":2}]
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

    # PUT valid, this creates an entry for user1 for the product_id prod1 with quantity 1
    res_put = put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # PUT valid the same item, should increase prod1 quantity to 2
    res_put = put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # PUT valid for user1, but different product, should increase quantity for prod2 to 1
    res_put = put_handler.handler(EVENT_2, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])

    # Assert that user1 has two products, prod1 with quantity 2 and prod2 with quantity 1
    BODY_EXPECT = {
        "userId" : EVENT_1['pathParameters']['userId'],
        "products" : [
            {"product_id" : json.loads(EVENT_1['body'])['product_id'], "quantity":2},
            {"product_id" : json.loads(EVENT_2['body'])['product_id'], "quantity":1}
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
    EVENT_NAME = 'valid_user1_prod1_addfield1'
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
    
    EVENT_NAME = 'valid_user1_prod1_addfield1'
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

    EVENT_NAME_1 = 'valid_user1_prod1_addfield1'
    EVENT_NAME_2 = 'valid_user1_prod2'
    EVENT_NAME_3 = 'valid_user2_prod1'
    
    EVENT_1 = generate_inputs[EVENT_NAME_1]
    EVENT_2 = generate_inputs[EVENT_NAME_2]
    EVENT_3 = generate_inputs[EVENT_NAME_3]
    
    # POST valid, this creates for userId a cart entry, multiple userId
    post_handler.handler(EVENT_1, CONTEXT_DUMMY)
    post_handler.handler(EVENT_3, CONTEXT_DUMMY)

    # PUT valid, this creates multiple entries
    # user1 prod1 - quantity 2
    # user1 prod2 - quantity 1
    # user2 prod1 - quantity 3
    put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    put_handler.handler(EVENT_1, CONTEXT_DUMMY)
    put_handler.handler(EVENT_2, CONTEXT_DUMMY)
    put_handler.handler(EVENT_3, CONTEXT_DUMMY)
    put_handler.handler(EVENT_3, CONTEXT_DUMMY)
    put_handler.handler(EVENT_3, CONTEXT_DUMMY)
    
    # DELETE, should result in
    # user1 prod1 - quantity 1
    # user2 prod1 - quantity 2
    delete_handler.handler(EVENT_1, CONTEXT_DUMMY)
    delete_handler.handler(EVENT_2, CONTEXT_DUMMY)
    delete_handler.handler(EVENT_3, CONTEXT_DUMMY)

    USER1_EXPECT = {
        "userId" : EVENT_1['pathParameters']['userId'],
        "products" : [
            {
                "product_id" : "product_one",
                "quantity" : 1,
                "brand":json.loads(EVENT_1['body'])['brand'],
                "image":json.loads(EVENT_1['body'])['image']
            }
        ]
    }
    
    USER2_EXPECT = {
        "userId" : EVENT_3['pathParameters']['userId'],
        "products" : [
            {
                "product_id" : "product_one",
                "quantity" : 2
            }
        ]
    }
    
    # Verify that GET returns the expected information
    res_get = get_handler.handler(EVENT_1, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == USER1_EXPECT
    
    res_get = get_handler.handler(EVENT_3, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == USER2_EXPECT



###
# Test PUT with additional fields
def test_PUT_addfield(dynamo_table, generate_inputs: dict[str,str]):
    """
    Add a new field to the body which should be written to the database and be retreived by the GET
    addfield should be overwritten, new field should be added, old fields should not be updated
    """

    EVENT_BASIS = generate_inputs['valid_user1_prod1']
    EVENT_ADDFIELD1 = generate_inputs['valid_user1_prod1_addfield1']
    EVENT_ADDFIELD2 = generate_inputs['valid_user1_prod1_addfield2']

    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT_BASIS, CONTEXT_DUMMY)

    # FIRST
    # PUT EVENT with same user to have quantity 1 on product_id
    res_put = put_handler.handler(EVENT_BASIS, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT_BASIS['pathParameters']['userId'],
        "products" : [{"product_id" : json.loads(EVENT_BASIS['body'])['product_id'], "quantity":1}]
    }
    assert res_body == BODY_EXPECT
    # Also assert with GET
    res_get = get_handler.handler(EVENT_BASIS, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200
    res_body = json.loads(res_get['body'])
    assert res_body == BODY_EXPECT

    # SECOND
    # PUT EVENT with additionalfield, should yield quantity 2 on product_id
    # and also brand "brand1" and image "image_one"
    res_put = put_handler.handler(EVENT_ADDFIELD1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    # Assert that the quantity is 2 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT_BASIS['pathParameters']['userId'],
        "products" : [{
            "product_id" : json.loads(EVENT_BASIS['body'])['product_id'],
            "quantity":2,
            "brand" : json.loads(EVENT_ADDFIELD1['body'])['brand'],
            "image" : json.loads(EVENT_ADDFIELD1['body'])['image']
            }]
    }
    assert res_body == BODY_EXPECT
    # Also assert with GET
    res_get = get_handler.handler(EVENT_ADDFIELD1, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200
    res_body = json.loads(res_get['body'])
    assert res_body == BODY_EXPECT

    # THIRD
    # PUT EVENT with additionalfield with a new value, should yield quantity 3 on product_id
    # and also update brand to brand2, leave image to image_one and add title title_one
    res_put = put_handler.handler(EVENT_ADDFIELD2, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    # Assert that the quantity is 3 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT_BASIS['pathParameters']['userId'],
        "products" : [{
            "product_id" : json.loads(EVENT_BASIS['body'])['product_id'],
            "quantity":3,
            "brand" : json.loads(EVENT_ADDFIELD2['body'])['brand'],
            "image" : json.loads(EVENT_ADDFIELD1['body'])['image'],
            "title" : json.loads(EVENT_ADDFIELD2['body'])['title']
            }]
    }
    assert res_body == BODY_EXPECT
    # Also assert with GET
    res_get = get_handler.handler(EVENT_ADDFIELD2, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200
    res_body = json.loads(res_get['body'])
    assert res_body == BODY_EXPECT

def test_PUT_addfield_ignore_quantity(dynamo_table, generate_inputs: dict[str,str]):
    """
    Assert that additionalfield quantity is ignored in PUT
    """

    EVENT_BASIS = generate_inputs['valid_user1_prod1']
    EVENT_ADDFIELD1 = generate_inputs['valid_user1_prod1_addfield1']
    EVENT_ADDFIELD_QUANTITY = generate_inputs['valid_user1_prod1_addfield_quantity']

    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT_BASIS, CONTEXT_DUMMY)

    # FIRST
    # PUT EVENT with same user to have quantity 1 on product_id
    res_put = put_handler.handler(EVENT_BASIS, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT_BASIS['pathParameters']['userId'],
        "products" : [{
            "product_id" : json.loads(EVENT_BASIS['body'])['product_id'],
            "quantity":1
        }]
    }
    assert res_body == BODY_EXPECT
    # Also assert with GET
    res_get = get_handler.handler(EVENT_BASIS, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200
    res_body = json.loads(res_get['body'])
    assert res_body == BODY_EXPECT

    # SECOND
    # PUT EVENT with additionalfield, should yield quantity 2 on product_id
    # and also brand "brand1" and image "image_one"
    res_put = put_handler.handler(EVENT_ADDFIELD1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    # Assert that the quantity is 2 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT_BASIS['pathParameters']['userId'],
        "products" : [{
            "product_id" : json.loads(EVENT_BASIS['body'])['product_id'],
            "quantity":2,
            "brand" : json.loads(EVENT_ADDFIELD1['body'])['brand'],
            "image" : json.loads(EVENT_ADDFIELD1['body'])['image']
            }]
    }
    assert res_body == BODY_EXPECT
    # Also assert with GET
    res_get = get_handler.handler(EVENT_ADDFIELD1, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200
    res_body = json.loads(res_get['body'])
    assert res_body == BODY_EXPECT

    # THIRD
    # PUT EVENT with additionalfield with a new value, should yield quantity 3 on product_id
    # and also update brand to brand2, leave image to image_one and NOT ADD OR CHANGE quantity
    res_put = put_handler.handler(EVENT_ADDFIELD_QUANTITY, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    # Assert that the quantity is 3 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT_BASIS['pathParameters']['userId'],
        "products" : [{
            "product_id" : json.loads(EVENT_BASIS['body'])['product_id'],
            "quantity":3,
            "brand" : json.loads(EVENT_ADDFIELD_QUANTITY['body'])['brand'],
            "image" : json.loads(EVENT_ADDFIELD1['body'])['image']
            }]
    }
    assert res_body == BODY_EXPECT
    # Also assert with GET
    res_get = get_handler.handler(EVENT_ADDFIELD_QUANTITY, CONTEXT_DUMMY)
    assert res_get['statusCode'] == 200
    res_body = json.loads(res_get['body'])
    assert res_body == BODY_EXPECT



###
# Test PUT_BATCH
def test_PUT_BATCH_once(dynamo_table, generate_inputs: dict[str,str]):
    """
    PUT BATCH on empty cart should return 404, no userId found
    PUT BATCH once should update the database
    PUT BATCH again with identical body should yield same entry
    """

    EVENT_NAME = 'valid_user1_prod1_addfield1'
    event_raw = generate_inputs[EVENT_NAME]
    # For the PUT_BATCH, the body looks different
    EVENT = {}
    EVENT['pathParameters'] = event_raw['pathParameters']
    EVENT['body'] = json.dumps({
        "products" : [json.loads(event_raw['body'])]
    })

    ###
    # Assert PUT on empty table returns 404, userId not found
    assert put_batch_handler.handler(EVENT, CONTEXT_DUMMY)['statusCode'] == 404

    # FIRST
    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    # PUT BATCH valid, this creates an entry for the userId
    res_put = put_batch_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the upadted entry is exactly the body
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : json.loads(EVENT['body'])['products']
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

    # SECOND
    # PUT BATCH valid again, should yield identical result
    res_put = put_batch_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_PUT_BATCH_multi(dynamo_table, generate_inputs: dict[str,str]):
    """
    PUT BATCH once should update the database
    PUT BATCH again with new body should yield same result
    """

    # Use arbitrary fields inside items of products
    EVENT_NAME = 'valid_user1_prod1_addfield1'
    event_raw = generate_inputs[EVENT_NAME]
    # For the PUT_BATCH, the body looks different

    EVENT1 = {}
    EVENT1['pathParameters'] = event_raw['pathParameters']
    EVENT1['body'] = json.dumps({
        "products":[{"field1":"value1", "field2":2}]
    })
    
    EVENT2 = {}
    EVENT2['pathParameters'] = event_raw['pathParameters']
    EVENT2['body'] = json.dumps({
        "products":[{"newfield1":"newvalue1", "newfield2":2222}]
    })
    
    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT1, CONTEXT_DUMMY)

    # FIRST
    # PUT BATCH valid, this creates an entry for the userId
    res_put = put_batch_handler.handler(EVENT1, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT1['pathParameters']['userId'],
        "products" : json.loads(EVENT1['body'])['products']
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT1, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

    # SECOND
    # PUT BATCH valid, this creates an new entry for the userId
    res_put = put_batch_handler.handler(EVENT2, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT2['pathParameters']['userId'],
        "products" : json.loads(EVENT2['body'])['products']
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT2, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT

def test_PUT_BATCH_addfield(dynamo_table, generate_inputs: dict[str,str]):
    """
    Test that additional fields apart from products in the body are ignored
    PUT BATCH one valid item with additional fields
    Assert that result in database does not contain those fields
    """

    EVENT_NAME = 'valid_user1_prod1_addfield1'
    event_raw = generate_inputs[EVENT_NAME]
    # For the PUT_BATCH, the body looks different
    EVENT = {}
    EVENT['pathParameters'] = event_raw['pathParameters']
    EVENT['body'] = json.dumps({
        "products" : [json.loads(event_raw['body'])],
        "additionalString" : "someString",
        "additionalNumber" : 1234,
        "additionalList" : ["a",2,{"foo":42}]
    })
    
    # POST valid, this creates for userId a cart entry
    post_handler.handler(EVENT, CONTEXT_DUMMY)

    # FIRST
    # PUT BATCH valid, this creates an entry for the userId
    res_put = put_batch_handler.handler(EVENT, CONTEXT_DUMMY)
    assert res_put['statusCode'] == 200
    res_body = json.loads(res_put['body'])
    
    # Assert that the quantity is 1 in the returned object
    BODY_EXPECT = {
        "userId" : EVENT['pathParameters']['userId'],
        "products" : json.loads(EVENT['body'])['products']
    }
    assert res_body == BODY_EXPECT

    # Verify that GET returns the same information
    res_get = get_handler.handler(EVENT, CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get_body == BODY_EXPECT
