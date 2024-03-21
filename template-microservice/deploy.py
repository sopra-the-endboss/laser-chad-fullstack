"""
Deploy one Dynamo DB
- template-microservice-db with the following keys
    - template-microservice-key-1
    - template-microservice-key-1

Deploy two lambda functions
- get_lambda for listing all currently saved items in the DB or a specific one with a given {id} in the pathParameter
- post_lambda for putting a new item to the DB

Deploy an API Gateway which provides routes as specified in resources_to_create.json
- xxx/template-microservice GET
    Get all items in the dynamo DB via lambda get_lambda
    Lambda fct: get_lambda
- xxx/template-microservice POST
    Write an item to the DB
    Lambda fct: post_lambda
- xxx/template-microservice/{template-microservice-key-1} GET
    Get all items where template-microservice-key-1 equals the value supplied in path between {}
    Lambda fct: get_lambda
"""

import os
import boto3
import simplejson as json
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--
# FOR MANUAL RUNING ONLY - DO NOT RUN IF IN A DOCKER CONTAINER
IN_DOCKER = os.environ.get('AM_I_IN_A_DOCKER_CONTAINER', False)

if not IN_DOCKER:
    os.chdir("./template-microservice")
    # Also set all AWS env vars, point to running localstack container not in a docker-compose network
    os.environ['AWS_DEFAULT_REGION']='us-east-1'
    os.environ['AWS_ENDPOINT_URL']='https://localhost.localstack.cloud:4566' # For manual, use the default localstack url
    os.environ['AWS_ACCESS_KEY_ID']='fakecred' # Sometimes boto3 needs credentials
    os.environ['AWS_SECRET_ACCESS_KEY']='fakecred' # Sometimes boto3 needs credentials
    os.environ['APIG_TAG'] = "apig_template"
    os.environ['APIG_TAG_ID'] = "API_TAG_ID"
    os.environ['APIG_STAGE'] = "PROD"
# FOR MANUAL RUNING ONLY END
##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--

import deploy_utils

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

print("Environment:\n")
pp.pprint(os.environ)

# Parameters
db_schema = get_db_config()
request_models = get_request_models()
request_validators = get_request_validators()
resources_to_create = get_resources_to_create()

LAMBDA_FUNCTIONS_TO_DEPLOY = ["get_lambda","post_lambda"] # TODO: Fetch names of all subdirs of lambdas/ instead of manually typing them out
LAMBDA_ROLE = "arn:aws:iam::000000000000:role/lambda-role" # given by localstack

DYNAMO_DB_NAME = db_schema['TableName']
APIG_NAME = os.environ['APIG_TAG']
APIG_TAG_ID = os.environ['APIG_TAG_ID']

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
        lambda_client = lambda_client,
        fct_name = lambda_function_to_create,
        env = {"TableName" : DYNAMO_DB_NAME}
    )
    print(f"Waiting over, function {lambda_function_to_create} is ready")
print("Lambda deployment done")

###
# API Gateway deployment
print("API Gateway deployment ...")
api_id = deploy_utils.create_api(
    apig_client = apig_client,
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
    # for i,resource_mapping in enumerate(resource_list):
    for i,resource_path_and_methods_for_path in enumerate(resource_list):
        # print(f"create resources ...")
        i_path = resource_path_and_methods_for_path['path']
        i_methods = resource_path_and_methods_for_path['methods_for_that_path']
        print(f"create resource {i_path}")
        # If we are in the first element of the top resource, the parent resource is root
        if i == 0:
            tmp_parent_res_id = None
        # Otherwise we use the resrouce id of the previous element in resource_type as parent
        tmp_parent_res_id = deploy_utils.create_resource(
            apig_client = apig_client,
            api_id = api_id,
            parent_id = tmp_parent_res_id,
            resource_path = i_path
        )

        print(f"create {len(i_methods)} methods for path {i_path}")
        for j,j_method_dict in enumerate(i_methods):
            j_method = j_method_dict['method']
            j_lambda_fct = j_method_dict['lambda_fct']
            print(f"create method {j_method} with function {j_lambda_fct}")
            
            # Get the lambda arn
            lambda_arn = lambdas[j_lambda_fct]

            # Create method and integration
            apig_new_method, apig_new_integration = deploy_utils.add_lambda_method_and_integration_to_resource(
                apig_client = apig_client,
                lambda_client = lambda_client,
                api_id = api_id,
                resource_id = tmp_parent_res_id,
                lambda_arn = lambda_arn,
                method = j_method,
                requestParameters = j_method_dict.get('requestParameters',{}), # This is optional, if empty pass empty dict
                requestModels = j_method_dict.get('requestModels',{}), # This is optional, if empty pass empty dict
                requestValidatorId = api_validators['bodyOnly'] # The default bodyOnly validator
            )

print("Create api deployment ...")
deploy_utils.deploy_api(
    apig_client = apig_client,
    api_id = api_id,
    stage_name = os.environ['APIG_STAGE']
)
print("API Gateway deployment done")

print("Deployment done")