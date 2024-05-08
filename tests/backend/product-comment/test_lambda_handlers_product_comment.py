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
get_handler_product_comment = importlib.import_module("backend.product-microservice.lambdas.get_product_comment.handler")
post_handler_product_comment = importlib.import_module("backend.product-microservice.lambdas.post_product_comment.handler")
delete_handler_product_comment = importlib.import_module("backend.product-microservice.lambdas.delete_product_comment.handler")


###
# Load configs
db_config_path = "./backend/product-microservice/config"
db_table_names = ("product-table", "product-comment-table")
db_schemas_to_create = {}
try:
    with open(f"{db_config_path}/db_schema.json","r") as file:
        db_schemas = json.load(file)
        for db_table_name in db_table_names:
            tmp_schema = next((db_schema for db_schema in db_schemas if db_schema['TableName'] == db_table_name), None)
            if tmp_schema is None:
                raise ValueError(f"Did not find db schema for {db_table_name}")
            else:
                db_schemas_to_create[db_table_name] = tmp_schema
except FileNotFoundError:
    print("Did not find json file with db config")


###
# Parameters
CONTEXT_DUMMY = None
PATHPARAMETER_NAME = "product_id" # corresponds to config, should match the resource definiton

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
def dynamo_table_product(db_client):
    db_schema_to_create = db_schemas_to_create['product-table']
    db_client.create_table(**db_schema_to_create)
    db_resource = boto3.resource("dynamodb")
    dynamo_table = db_resource.Table(db_schema_to_create['TableName'])
    yield dynamo_table

@mock_aws
@pytest.fixture
def dynamo_table_product_comment(db_client):
    db_schema_to_create = db_schemas_to_create['product-comment-table']
    db_client.create_table(**db_schema_to_create)
    db_resource = boto3.resource("dynamodb")
    dynamo_table = db_resource.Table(db_schema_to_create['TableName'])
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
    
    # prdoduct_id
    prod_id_1 = "IPhone"
    prod_id_2 = "Gameboy"

    # valid reviews
    review1 = {
        "user":"User First Reviewer",
        "user_id":"user_first_reviewer_id",
        "rating":5,
        "review":"This is a great product",
        "title":"Great product",
        "date":"2021-10-10",
        "review_id":"review_id_1"
    }
    review2 = {
        "user":"User Second Reviewer",
        "user_id":"user_second_reviewer_id",
        "rating":4,
        "review":"Second review",
        "title":"Second review",
        "date":"2021-01-02",
        "review_id":"review_id_2"
    }


    ###
    # Create events

    # BODY EMPTY

    inputs_to_return['empty_pathParameter'] = {
        "body" : "",
        "pathParameters" : {}
    }
    
    inputs_to_return['wrong_pathParameter'] = {
        "body" : "",
        "pathParameters" : {"wrongPathParameter":"wrongPathParameter"}
    }
    
    inputs_to_return['wrong_pathParameter_array'] = {
        "body" : "",
        "pathParameters" : {"wrongPathParameterArray":["wrongPathParameterArrayElement"]}
    }

    inputs_to_return['invalid_pathParameter_emptyBody'] = {
        "body" : "",
        "pathParameters" : {"product_id":["asdf",123]}
    }
    
    inputs_to_return['valid_pathParameter_emptyBody'] = {
        "body" : "",
        "pathParameters" : {"product_id":prod_id_1}
    }
    
    inputs_to_return['valid_pathParameter_emptyBody_additionalPathParameter'] = {
        "body" : "",
        "pathParameters" : {
            "product_id":prod_id_2,
            "additionalPathParameter":"additionalPathParameter"
        }
    }

    # TODOD: BODY COMMENT INVALID
    
    # BODY COMMENT VALID, PATHPARAMETERS VALID
    inputs_to_return['valid_body_valid_pathParameter_prod1_review1'] = {
        "body" : json.dumps(review1),
        "pathParameters" : {"product_id":prod_id_1}
    }
    
    inputs_to_return['valid_body_valid_pathParameter_prod1_review2'] = {
        "body" : json.dumps(review2),
        "pathParameters" : {"product_id":prod_id_1}
    }
    
    inputs_to_return['valid_body_valid_pathParameter_prod2_review1'] = {
        "body" : json.dumps(review1),
        "pathParameters" : {"product_id":prod_id_2}
    }
    
    inputs_to_return['valid_body_valid_pathParameter_prod2_review2'] = {
        "body" : json.dumps(review2),
        "pathParameters" : {"product_id":prod_id_2}
    }

    return inputs_to_return

def test_simple_count(dynamo_table_product):
    item_count = dynamo_table_product.item_count
    assert item_count == 0

@mock_aws
def test_db_comment_does_not_exist(set_env):
    # Pass in empty arguments, we only want to test 400 if table does not exist
    dummy_event = {}
    dummy_context = {}

    res = get_handler_product_comment.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400
    
    res = post_handler_product_comment.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400
    
    res = delete_handler_product_comment.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400


###
# Test pathParameters
def test_GET(dynamo_table_product_comment, generate_inputs: dict[str,str]):
    
    ###
    # Assert GET with empty or wrong pathParameters returns 200 -> Empty table
    res_empty_pathParameter = get_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_empty_pathParameter['statusCode'] == 200
    assert res_empty_pathParameter['body'] == json.dumps([])
    
    res_wrong_pathParameter = get_handler_product_comment.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 200
    assert res_wrong_pathParameter['body'] == json.dumps([])

    res_wrong_pathParameter = get_handler_product_comment.handler(generate_inputs['wrong_pathParameter_array'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 200
    assert res_wrong_pathParameter['body'] == json.dumps([])

    res_invalid_pathParameter = get_handler_product_comment.handler(generate_inputs['invalid_pathParameter_emptyBody'], CONTEXT_DUMMY)
    assert res_invalid_pathParameter['statusCode'] == 200
    assert res_invalid_pathParameter['body'] == json.dumps([])
    
    # Assert correct GET pathParameters also yield 200 and an empty result
    res_valid_pathParameter = get_handler_product_comment.handler(generate_inputs['valid_pathParameter_emptyBody'], CONTEXT_DUMMY)
    assert res_valid_pathParameter['statusCode'] == 200
    assert res_valid_pathParameter['body'] == json.dumps([])

def test_POST(dynamo_table_product_comment, generate_inputs: dict[str,str]):
    
    ###
    # Assert POST with empty pathParameter raises 400
    res_empty_body = post_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400
    
    ###
    # Assert POST with wrong pathParameters raises 400
    res_empty_body = post_handler_product_comment.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400
    res_empty_body = post_handler_product_comment.handler(generate_inputs['wrong_pathParameter_array'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400
    
    ###
    # Assert POST with valid pathParameter empty Body raises 400
    res_empty_body = post_handler_product_comment.handler(generate_inputs['valid_pathParameter_emptyBody'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400
    res_empty_body = post_handler_product_comment.handler(generate_inputs['valid_pathParameter_emptyBody_additionalPathParameter'], CONTEXT_DUMMY)
    assert res_empty_body['statusCode'] == 400
    
def test_POST_GET(dynamo_table_product_comment, generate_inputs: dict[str,str]):
    
    ###
    # Assert POST valid -> 200 and return the review_id
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review1'
    EVENT = generate_inputs[EVENT_NAME]
    EVENT_REVIEW = json.loads(EVENT['body'])
    res_valid_pathParameter = post_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    assert res_valid_pathParameter['statusCode'] == 200
    assert EVENT_REVIEW in json.loads(res_valid_pathParameter['body'])['reviews']
    assert len(json.loads(res_valid_pathParameter['body'])['reviews']) == 1 # Only one review

    ###
    # Assert GET all -> 200 and return one item, containing our product_id
    res_get_all = get_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_get_all['statusCode'] == 200
    assert len(json.loads(res_get_all['body'])) == 1
    assert EVENT_REVIEW_ID in [prod['product_id'] for prod in json.loads(res_get_all['body'])]

    # ###
    # # Assert POST valid with another prod_id additional fields -> 200 and return the product_id
    # EVENT2_NAME = 'valid_body_additionalFields'
    # EVENT2 = generate_inputs[EVENT2_NAME]
    # EVENT2_BODY = json.loads(EVENT2['body'])
    # EVENT2_PRODUCT_ID = EVENT2_BODY['product_id']
    # res_valid_pathParameter = post_handler_product_comment.handler(EVENT2, CONTEXT_DUMMY)
    # assert res_valid_pathParameter['statusCode'] == 200
    # assert json.loads(res_valid_pathParameter['body'])['product_id'] == EVENT2_PRODUCT_ID

    # ###
    # # Assert GET all -> 200 and return two item, containing our two product_ids
    # res_get_all = get_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    # assert res_get_all['statusCode'] == 200
    # assert len(json.loads(res_get_all['body'])) == 2
    # assert EVENT2_PRODUCT_ID in [prod['product_id'] for prod in json.loads(res_get_all['body'])]
    # # Assert all fields from the product are there after POST and GET
    # res_get_all_product = next((product for product in json.loads(res_get_all['body']) if product['product_id'] == EVENT2_PRODUCT_ID), None)
    # assert EVENT2_BODY == res_get_all_product

    # ###
    # # Assert POST valid again, overwrite the first product_id -> 200 and return the product_id
    # EVENT_NAME = 'valid_body_single'
    # EVENT_OVERWRITE = generate_inputs[EVENT_NAME].copy()
    # EVENT_OVERWRITE_BODY = json.loads(EVENT_OVERWRITE['body'])
    # # Add some additional fields, replace body in EVENT_OVERWRITE
    # EVENT_OVERWRITE_BODY['additionalField'] = "additionalValue"
    # EVENT_OVERWRITE['body'] = json.dumps(EVENT_OVERWRITE_BODY)
    # EVENT_OVERWRITE_PRODUCT_ID = json.loads(EVENT_OVERWRITE['body'])['product_id']
    # res_valid_pathParameter = post_handler_product_comment.handler(EVENT_OVERWRITE, CONTEXT_DUMMY)
    # assert res_valid_pathParameter['statusCode'] == 200
    # assert json.loads(res_valid_pathParameter['body'])['product_id'] == EVENT_OVERWRITE_PRODUCT_ID

    # ###
    # # Assert GET all -> 200 and return two item, containing the updated first product
    # res_get_all = get_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    # assert res_get_all['statusCode'] == 200
    # assert len(json.loads(res_get_all['body'])) == 2
    # assert EVENT_OVERWRITE_PRODUCT_ID in [prod['product_id'] for prod in json.loads(res_get_all['body'])]
    # # Assert all fields from the product are there after POST and GET
    # res_get_all_product = next((product for product in json.loads(res_get_all['body']) if product['product_id'] == EVENT_OVERWRITE_PRODUCT_ID), None)
    # assert EVENT_OVERWRITE_BODY == res_get_all_product
    
# def test_DELETE_pathParameter(dynamo_table_product, dynamo_table_product_comment, generate_inputs: dict[str,str]):

#     ###
#     # NOTE: Only test the product table component, not the comment table
#     # NOTE: We do not test non-string pathParameters, as this is not possible with the API Gateway

#     # Assert empty pathParameters
#     res = delete_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
#     assert res['statusCode'] == 400

#     # Assert wrong pathParameters name
#     res = delete_handler_product_comment.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
#     assert res['statusCode'] == 400
    
#     # Assert additional pathParameter is ignored -> 200 on empty table
#     res = delete_handler_product_comment.handler(generate_inputs['valid_pathParameter_emptyBody_additionalPathParameter'], CONTEXT_DUMMY)
#     assert res['statusCode'] == 200

# def test_DELETE_nomatch(dynamo_table_product, dynamo_table_product_comment, generate_inputs: dict[str,str]):

#     ###
#     # NOTE: Only test the product table component, not the comment table
#     # NOTE: We do not test non-string pathParameters, as this is not possible with the API Gateway

#     # Assert no match returns 200 and the product_id
#     EVENT_NAME = 'valid_pathParameter_emptyBody'
#     EVENT = generate_inputs[EVENT_NAME]
#     EVENT_PRODUCT_ID_EXPECTED = EVENT['pathParameters']['product_id']
#     res = delete_handler_product_comment.handler(generate_inputs['valid_pathParameter_emptyBody'], CONTEXT_DUMMY)
#     assert res['statusCode'] == 200
#     assert json.loads(res['body'])['product_id'] == EVENT_PRODUCT_ID_EXPECTED

#     # POST a product to table
#     EVENT_NAME = 'valid_body_single'
#     EVENT = generate_inputs[EVENT_NAME]
#     _ = post_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)

#     # Assert no match still returns 200 and the product_id
#     res = delete_handler_product_comment.handler(generate_inputs['valid_pathParameter_emptyBody'], CONTEXT_DUMMY)
#     assert res['statusCode'] == 200
#     assert json.loads(res['body'])['product_id'] == EVENT_PRODUCT_ID_EXPECTED

# def test_DELETE(dynamo_table_product, dynamo_table_product_comment, generate_inputs: dict[str,str]):

#     ###
#     # NOTE: Only test the product table component, not the comment table

#     EVENT_GET = generate_inputs['empty_pathParameter']

#     # POST a product to table, GET to assert item count 2
#     EVENT_NAME = 'valid_body_valid_pathParameters_single'
#     EVENT = generate_inputs[EVENT_NAME]
#     EVENT_PRODUCT_ID_EXPECTED = EVENT['pathParameters']['product_id']

#     _ = post_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)    
    
#     # GET and assert 200 and empty table
#     res_get_all = get_handler_product_comment.handler(EVENT_GET, CONTEXT_DUMMY)
#     assert res_get_all['statusCode'] == 200
#     assert len(json.loads(res_get_all['body'])) == 1

#     # DELETE and assert 200 and product_id
#     res_delete = delete_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
#     assert res_delete['statusCode'] == 200
#     assert json.loads(res_delete['body'])['product_id'] == EVENT_PRODUCT_ID_EXPECTED

#     # GET and assert 200 and empty table
#     res_get_all = get_handler_product_comment.handler(EVENT_GET, CONTEXT_DUMMY)
#     assert res_get_all['statusCode'] == 200
#     assert len(json.loads(res_get_all['body'])) == 0

#     # POST a product twice, with another event
#     EVENT2_NAME = 'valid_body_valid_pathParameters_additionalFields_body'
#     EVENT2 = generate_inputs[EVENT2_NAME]
#     EVENT2_PRODUCT_ID_EXPECTED = EVENT2['pathParameters']['product_id']
#     _ = post_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
#     _ = post_handler_product_comment.handler(EVENT2, CONTEXT_DUMMY)

#     # GET and assert 200 and item count 2
#     res_get_all = get_handler_product_comment.handler(EVENT_GET, CONTEXT_DUMMY)
#     assert res_get_all['statusCode'] == 200
#     assert len(json.loads(res_get_all['body'])) == 2

#     # DELETE one product, assert 200 and product_id
#     res_delete = delete_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
#     assert res_delete['statusCode'] == 200
#     assert json.loads(res_delete['body'])['product_id'] == EVENT_PRODUCT_ID_EXPECTED

#     # GET and assert 200 and the other product_id left
#     res_get_all = get_handler_product_comment.handler(EVENT_GET, CONTEXT_DUMMY)
#     assert res_get_all['statusCode'] == 200
#     assert len(json.loads(res_get_all['body'])) == 1
#     assert json.loads(res_get_all['body'])[0]['product_id'] == EVENT2_PRODUCT_ID_EXPECTED
