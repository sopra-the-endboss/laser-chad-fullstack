import os
import re
import json
import requests
from pyperclip import copy

os.chdir("./backend")

import boto3
import zipfile
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

import deploy_utils

# Set env variables
os.environ['AWS_DEFAULT_REGION']='us-east-1'
os.environ['AWS_ENDPOINT_URL']='http://localhost.localstack.cloud:4566'
os.environ['AWS_ACCESS_KEY_ID']='fakecredentials'
os.environ['AWS_SECRET_ACCESS_KEY']='fakecredentials'

def get_db_config() -> dict[str]:
    """
    Retreive all configurations for the dynamo db
    """
    print("Try to load the DB schema ...")
    try:
        with open("config/db_schema.json","r") as file:
            db_schema = json.load(file)
    except FileNotFoundError:
        print("Did not find json file with db config")
    return db_schema

def get_request_models() -> dict[str]:
    """
    Retreive all configurations for the request models
    """
    print("Try to load request models ...")
    try:
        with open("config/request_models.json","r") as file:
            models = json.load(file)
    except FileNotFoundError:
        print("Did not find json file with request models config")
    return models

def get_request_validators() -> dict[str]:
    """
    Retreive all configurations for the request validators
    """
    print("Try to load request validators ...")
    try:
        with open("config/request_validators.json","r") as file:
            validators = json.load(file)
    except FileNotFoundError:
        print("Did not find json file with request validators config")
    return validators

def get_resources_to_create() -> dict:
    """
    Retreive all configurations for the resources to create
    """
    print("Try to load resrouces to create config ...")
    try:
        with open("config/resources_to_create.json","r") as file:
            res = json.load(file)
    except FileNotFoundError:
        print("Did not find json file with resources to create config")
    return res

# Parameters
db_schema = get_db_config()
request_models = get_request_models()
request_validators = get_request_validators()
resources_to_create = get_resources_to_create()

LAMBDA_FUNCTIONS_TO_DEPLOY = ["get_shopprofile","post_shopprofile"]
LAMBDA_ROLE = "arn:aws:iam::000000000000:role/lambda-role" # given by localstack

DYNAMO_DB_NAME = db_schema['TableName']
APIG_NAME = "apig_shopprofile"
APIG_TAG_ID = "APIG_TAG_ID"
APIG_STAGE = "PROD"

# Create clients
lambda_client = boto3.client("lambda")
dynamo_client = boto3.client("dynamodb")
apig_client = boto3.client("apigateway")

###
# Dynamo DB deployment  
print("Dynamo DB deployment ...")
dynamo_client.create_table(**db_schema)
print("Dynamo DB created")

###
# Lambda deployment
print("Lambda deployment ...")
lambdas = {}
for lambda_function_to_create in LAMBDA_FUNCTIONS_TO_DEPLOY:
    lambdas[lambda_function_to_create] = deploy_utils.deploy_lambda(
        lambda_function_to_create,
        env = {"TableName" : DYNAMO_DB_NAME}
    )
    print(f"Waiting over, function {lambda_function_to_create} is ready")
print("Lambda deployment done")

###
# API Gateway deployment
print("API Gateway deployment ...")
api_id = deploy_utils.create_api(
    api_name = APIG_NAME,
    api_tag = APIG_NAME,
    tag_id = APIG_TAG_ID
)
print(f"Create api request models ...")
for model_name, model in request_models.items():
    apig_client.create_model(
        restApiId = api_id,
        name = model_name,
        schema = json.dumps(model['model_spec']),
        contentType = model['contentType']        
    )
print("Create api request validators ...")
api_validators = {}
for validator_name, validator in request_validators.items():
    validator = apig_client.create_request_validator(
        restApiId = api_id,
        name = validator_name,
        validateRequestBody = validator['validateRequestBody'],
        validateRequestParameters = validator['validateRequestParameters']
    )
    api_validators[validator_name] = validator['id']
print("Create method and integration ...")
for resource_type, resource_list in resources_to_create.items():
    print(f"create {resource_type} ... ")
    for i,resource_mapping in enumerate(resource_list):
        print(f"create resources {resource_mapping}")
        lambda_arn = lambdas[resource_mapping['lambda_fct']]
        if i == 0:
            tmp_parent_res_id = None
        tmp_parent_res_id = deploy_utils.create_resource(
            api_id = api_id,
            parent_id = tmp_parent_res_id,
            resource_path = resource_mapping['path']
        )
        resource_mapping['resource_id'] = tmp_parent_res_id
        print(f"write lambda and integration for resoucres mapping {json.dumps(resource_mapping)} ...")
        apig_new_method, apig_new_integration = deploy_utils.add_lambda_method_and_integration_to_resource(
            api_id = api_id,
            resource_id = resource_mapping['resource_id'],
            lambda_arn = lambda_arn,
            method = resource_mapping['method'],
            requestParameters = resource_mapping.get('requestParameters',{}), # This is optional, if empty pass empty dict
            requestModels = resource_mapping.get('requestModels',{}), # This is optional, if empty pass empty dict
            requestValidatorId = api_validators['bodyOnly'] # The default bodyOnly validator
        )

print("Create api deployment ...")
deploy_utils.deploy_api(
    api_id = api_id,
    stage_name = os.environ['APIG_STAGE']
)
print("API Gateway deployment done")

print("Deployment done")


# Now generate URLs with a given tag
path_to_build_url_for = "shopprofile"

# Look at available resources
pp.pprint(apig_client.get_resources(restApiId = api_id)['items'])
[res['path'] for res in apig_client.get_resources(restApiId = api_id_to_build_url_for)['items']]

# Send requests to test
url = deploy_utils.get_resource_path(api_id, APIG_STAGE, path_to_build_url_for)
response = requests.get(url)
print(response.text)

response = requests.get(
    get_resource_path(
        api_id = find_api_id_by_tag(tag_key = TAG_ID, tag_value = f"tag_{tag_to_use}"),
        resource_path = "/getSomething/69"
    )
)
print(response.text)

response = requests.post(
    url_built,
    headers = {'Content-Type':'application/json'},
    json = {"post1":"somestring","post2":{"nested1":1}}
)
print(response.text)