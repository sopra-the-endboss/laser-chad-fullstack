import os
import boto3
from moto import mock_aws
import pytest
from pprint import PrettyPrinter
pp = PrettyPrinter(indent = 2)

###
# define DB config
db_schema = {
"TableName":"cart-db",
"KeySchema": [
    {"AttributeName": "userId", "KeyType": "HASH"}
],
"AttributeDefinitions": [
    {"AttributeName": "userId", "AttributeType": "S"}
],
"BillingMode": "PAY_PER_REQUEST"
}

@pytest.fixture
def set_env():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

    del os.environ['AWS_ENDPOINT_URL']

@mock_aws
def test_simple(set_env):

    pp.pprint(dict(os.environ))

    
    db_client = boto3.client("dynamodb")
    
    print(db_client)
    
    db_client.create_table(**db_schema)
    
    db_resource = boto3.resource("dynamodb")
    
    dynamo_table = db_resource.Table(db_schema['TableName'])

    pp.pprint(dynamo_table.scan())

    
    assert True
