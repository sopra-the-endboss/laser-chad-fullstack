"""
Template to run pytests with boto3 and moto

NOTE: It might need some additional local VS Code setup to run pytest in the VS code plugin.
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
# Load configs
db_config_path = "./template-microservice/config"
try:
    with open(f"{db_config_path}/db_schema.json","r") as file:
        db_schemas = json.load(file)
        db_schema = db_schemas[0] # Get the first table schema
except FileNotFoundError:
    print("Did not find json file with db config")

###
# Import the Lambda GET handler
import importlib
imported_module = importlib.import_module("template-microservice.lambdas.get_lambda.handler")
get_handler = imported_module

###
# Fixtures
@mock_aws
@pytest.fixture
def set_env():
    """
    Make sure AWS environment variables are set/unset correctly before and after each test
    If AWS_ENDPOINT_URL is set, this interferes with the moto framework!
    """

    os.environ['TableName'] = db_schema['TableName']

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
    Here you can return events with which you want to test your API services
    """
    
    inputs_to_return = {}
    
    # userId
    user1 = 1

    # prdoduct_id
    prod1 = "product_one"
    prod2 = "product_two"

    ###
    # Create events
    inputs_to_return['missing_pathParameter'] = {
        "body" : ""
        # missing pathParameter
    }
    
    inputs_to_return['wrong_pathParameter'] = {
        "body" : "",
        "pathParameters" : "wrongPathParameters"
    }
    
    inputs_to_return['valid_user1_prod1'] = {
        "body" : json.dumps({"product_id":prod1}),
        "pathParameters" : {"userId":user1}
    }
    
    inputs_to_return['valid_user1_prod2'] = {
        "body" : json.dumps({"product_id":prod2}),
        "pathParameters" : {"userId":user1}
    }

    return inputs_to_return

@mock_aws
def test_simple_count(dynamo_table):
    item_count = dynamo_table.item_count
    assert item_count == 0