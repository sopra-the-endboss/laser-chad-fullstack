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
    """
    Make sure AWS environment variables are set/unset correctly.
    If AWS_ENDPOINT_URL is set, this interferes with the moto framework!
    """
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
        
@mock_aws
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

def test_simple(set_up_db):
    item_count = set_up_db.item_count
    print(item_count)
    assert True
