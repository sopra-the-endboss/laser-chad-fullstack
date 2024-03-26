"""
We do NOT test the API request model itself
The handler must assume valid data is passed from the API Gateway
We do however test statusCode in case of unexpected behavior
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
import cart.lambdas.get_cart.handler as get_handler

###
# Load configs
db_config_path = "./cart/config"
try:
    with open(f"{db_config_path}/db_schema.json","r") as file:
        db_schema = json.load(file)
except FileNotFoundError:
    print("Did not find json file with db config")

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

@pytest.fixture
def db_client(set_env):
    with mock_aws():
        yield boto3.client("dynamodb")
        
@pytest.fixture
def set_up_db(db_client):

    pp.pprint(dict(os.environ))

    print("set_up_db: this is db_schema:")
    pp.pprint(db_schema)

    db_client.create_table(**db_schema)
    print("Table created")

    db_resource = boto3.resource("dynamodb")
    print("Resource created")
    
    dynamo_table = db_resource.Table(db_schema['TableName'])
    print("TableObject created")
    
    yield dynamo_table

@pytest.fixture
def empty_input() -> tuple[dict,dict]:
    return ({},{})

@pytest.fixture
def events() -> dict[str,dict]:
    
    events_to_return = {}

    events_to_return['put_valid_1'] = {"product_id":"prod_1"}
    events_to_return['put_valid_1_add'] = {"product_id":"prod_1", "additionalString":"additionalString", "additionalNumber":42}

def test_simple_count(set_up_db):
    item_count = set_up_db.item_count
    assert item_count == 0

def test_get_db_does_not_exist(set_env):
    # Pass in empty arguments, we only want to test 400 if table does not exist
    dummy_event = {}
    dummy_context = {}

    # Remove TableName from environment
    del os.environ['TableName']

    res = get_handler.handler(dummy_event, dummy_context)
    assert res['statusCode'] == 400




