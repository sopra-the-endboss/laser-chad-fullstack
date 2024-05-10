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
    # Assert POST valid -> 200 and return the full object
    # Assert we can add random fields to the review, as long as the data model is fulfilled
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review1'
    EVENT = generate_inputs[EVENT_NAME]
    EVENT_PRODUCUT_ID = EVENT['pathParameters']['product_id']
    EVENT_REVIEW = json.loads(EVENT['body'])
    # Make copy of event wiht additonal review field
    EVENT_ADDITION = EVENT.copy()
    EVENT_ADDITION['body'] = json.dumps({**EVENT_REVIEW, "additionalField":"additionalValue"})
    res = post_handler_product_comment.handler(EVENT_ADDITION, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert EVENT_REVIEW in res_body['reviews']
    assert len(res_body['reviews']) == 1 # Only one review

    ###
    # Assert GET all -> 200 and return one item, containing our product and review
    res_get_all = get_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    res_get_all_body = json.loads(res_get_all['body'])
    assert res_get_all['statusCode'] == 200
    assert len(res_get_all_body) == 1
    assert res_get_all_body[0]['product_id'] == EVENT_PRODUCUT_ID
    assert len(res_get_all_body[0]['reviews']) == 1
    assert EVENT_REVIEW in res_get_all_body[0]['reviews']
    
    ###
    # Assert POST valid with another review for same prod_id -> 200 and return the list with one product with two reviews
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review2'
    EVENT = generate_inputs[EVENT_NAME]
    EVENT_PRODUCUT_ID = EVENT['pathParameters']['product_id']
    EVENT_REVIEW = json.loads(EVENT['body'])
    res = post_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert EVENT_REVIEW in res_body['reviews']
    assert len(res_body['reviews']) == 2 # Now two reviews

    ###
    # Assert GET all -> 200 and return one item, containing our product and two review
    res_get_all = get_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    res_get_all_body = json.loads(res_get_all['body'])
    assert res_get_all['statusCode'] == 200
    assert len(res_get_all_body) == 1
    assert res_get_all_body[0]['product_id'] == EVENT_PRODUCUT_ID
    assert len(res_get_all_body[0]['reviews']) == 2
    assert EVENT_REVIEW in res_get_all_body[0]['reviews']

    ###
    # Assert GET prod1 -> 200 and return list with one item, containing our product and two reviews
    res_get = get_handler_product_comment.handler(generate_inputs['valid_body_valid_pathParameter_prod1_review1'], CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get['statusCode'] == 200
    assert len(res_get_body) == 1
    assert res_get_body[0]['product_id'] == EVENT_PRODUCUT_ID
    assert len(res_get_body[0]['reviews']) == 2
    assert EVENT_REVIEW in res_get_all_body[0]['reviews']

    ###
    # Assert POST valid with product_id 2 -> 200 and return the full object
    EVENT_NAME = 'valid_body_valid_pathParameter_prod2_review1'
    EVENT = generate_inputs[EVENT_NAME]
    EVENT_PRODUCUT_ID = EVENT['pathParameters']['product_id']
    EVENT_REVIEW = json.loads(EVENT['body'])
    res = post_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert EVENT_REVIEW in res_body['reviews']
    assert len(res_body['reviews']) == 1 # So far only one review
    
def test_DELETE_invalid_pathParameters(dynamo_table_product_comment, generate_inputs: dict[str,str]):

    ###
    # Test invalid inputs to DELETE
    
    ###
    # Assert DELETE with empty pathParameter raises 400
    res_empty_pathParameter = delete_handler_product_comment.handler(generate_inputs['empty_pathParameter'], CONTEXT_DUMMY)
    assert res_empty_pathParameter['statusCode'] == 400

    res_wrong_pathParameter = delete_handler_product_comment.handler(generate_inputs['wrong_pathParameter'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 400

    res_wrong_pathParameter = delete_handler_product_comment.handler(generate_inputs['wrong_pathParameter_array'], CONTEXT_DUMMY)
    assert res_wrong_pathParameter['statusCode'] == 400

def test_DELETE_delete_all_reviews_for_product(dynamo_table_product_comment, generate_inputs: dict[str,str]):

    ###
    # Setup the DB with some products and reviews
    events_to_post = [
        'valid_body_valid_pathParameter_prod1_review1',
        'valid_body_valid_pathParameter_prod1_review2',
        'valid_body_valid_pathParameter_prod2_review1',
        'valid_body_valid_pathParameter_prod2_review2'
    ]
    for e in events_to_post:
        post_handler_product_comment.handler(generate_inputs[e], CONTEXT_DUMMY)

    ###
    # Assert DELETE prod1 review1 -> 200 and return the entries for prod1 without review1, but with review2
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review1'
    EVENT = generate_inputs[EVENT_NAME]
    EVENT_PRODUCUT_ID = EVENT['pathParameters']['product_id']
    EVENT_REVIEW = json.loads(EVENT['body'])
    res = delete_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert res_body['product_id'] == EVENT_PRODUCUT_ID
    assert EVENT_REVIEW not in res_body['reviews']
    assert len(res_body['reviews']) == 1

    ###
    # Assert DELETE prod1 review2 -> 200 and return empty list
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review2'
    EVENT = generate_inputs[EVENT_NAME]
    EVENT_PRODUCUT_ID = EVENT['pathParameters']['product_id']
    EVENT_REVIEW = json.loads(EVENT['body'])
    res = delete_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 200
    assert res_body['product_id'] == EVENT_PRODUCUT_ID
    assert EVENT_REVIEW not in res_body['reviews']
    assert len(res_body['reviews']) == 0

    ###
    # Assert GET for prod1 does find it, with emtpy reviews list
    res_get = get_handler_product_comment.handler(generate_inputs['valid_body_valid_pathParameter_prod1_review1'], CONTEXT_DUMMY)
    res_get_body = json.loads(res_get['body'])
    assert res_get['statusCode'] == 200
    assert res_get_body[0]['product_id'] == EVENT_PRODUCUT_ID
    assert res_get_body[0]['reviews'] == []

def test_DELETE_404(dynamo_table_product_comment, generate_inputs: dict[str,str]):

    ###
    # Assert DELETE on nonexistent product_id -> 404
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review1'
    EVENT = generate_inputs[EVENT_NAME]
    res = delete_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 404

    ###
    # Assert DELETE on nonexistent review_id -> 404
    # First POST prod1 review1
    post_handler_product_comment.handler(generate_inputs['valid_body_valid_pathParameter_prod1_review1'], CONTEXT_DUMMY)
    # then DELETE on review2
    EVENT_NAME = 'valid_body_valid_pathParameter_prod1_review2'
    EVENT = generate_inputs[EVENT_NAME]
    res = delete_handler_product_comment.handler(EVENT, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 404

def test_DELETE_401(dynamo_table_product_comment, generate_inputs: dict[str,str]):

    # First POST prod1 review1
    post_handler_product_comment.handler(generate_inputs['valid_body_valid_pathParameter_prod1_review1'], CONTEXT_DUMMY)

    # Create a new EVENT where the user_id is not a valid one to delete the posted comment
    EVENT_WITH_INVALID_USER = {
        "body" : json.dumps({
            "user":"INVALID USER",
            "user_id":"INVALID USER ID",
            "rating":5,
            "review":"This is a great product",
            "title":"Great product",
            "date":"2021-10-10",
            "review_id":"review_id_1"
            }),
        "pathParameters" : {"product_id":generate_inputs['valid_body_valid_pathParameter_prod1_review1']['pathParameters']['product_id']}
    }

    ###
    # Assert DELETE on prod1 with invalid user_id -> 401
    res = delete_handler_product_comment.handler(EVENT_WITH_INVALID_USER, CONTEXT_DUMMY)
    res_body = json.loads(res['body'])
    assert res['statusCode'] == 401
