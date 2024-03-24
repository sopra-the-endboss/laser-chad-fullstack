import os
import simplejson as json
import boto3
from moto import mock_aws
import pytest
from pprint import PrettyPrinter
pp = PrettyPrinter(indent = 2)

###
# deploy_utils
print(os.getcwd())
import sys
print(sys.path)
sys.path.insert(0,f"{os.getcwd()}/template-microservice")
import deploy_utils

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
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

@mock_aws
@pytest.fixture
def db_client(set_env):
    db_client = boto3.client("dynamodb")
    yield db_client

@mock_aws
@pytest.fixture
def set_up_db(set_env, db_client):
    print("set_up_db: this is db_schema:")
    pp.pprint(db_schema)

    print(db_client)

    db_client.create_table(**db_schema)
    db_resource = boto3.resource("dynamodb")
    dynamo_table = db_resource.Table(db_schema['TableName'])
    yield dynamo_table

@mock_aws
def test_simple(set_up_db):
    # with mock_aws():
    #     item_count = set_up_db.item_count()
    #     print(item_count)
    assert True
