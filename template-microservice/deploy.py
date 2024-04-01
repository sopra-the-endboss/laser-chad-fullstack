"""
Deploy one Dynamo DB
- template-microservice-db with the following keys
    - template-microservice-key-1
    - template-microservice-key-1

Deploy two lambda functions
- get_lambda for listing all currently saved items in the DB or a specific one with a given {id} in the pathParameter
- post_lambda for putting a new item to the DB

Update a API Gateway which provides routes as specified in resources_to_create.json
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
import botocore
import simplejson as json
from datetime import datetime
import time
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--
# FOR MANUAL RUNING ONLY - DO NOT RUN IF IN A DOCKER CONTAINER
IN_DOCKER = os.environ.get('AM_I_IN_A_DOCKER_CONTAINER', False)

if not IN_DOCKER:
    os.chdir("./product-microservice")
    # Also set all AWS env vars, point to running localstack container not in a docker-compose network
    os.environ['AWS_DEFAULT_REGION']='us-east-1'
    os.environ['AWS_ENDPOINT_URL']='https://localhost.localstack.cloud:4566' # For manual, use the default localstack url
    os.environ['AWS_ACCESS_KEY_ID']='fakecred' # Sometimes boto3 needs credentials
    os.environ['AWS_SECRET_ACCESS_KEY']='fakecred' # Sometimes boto3 needs credentials
    os.environ['APIG_TAG'] = "apig-main"
    os.environ['APIG_TAG_ID'] = "API_TAG_ID"
    os.environ['APIG_STAGE'] = "PROD"
    os.environ['APIG_WAIT'] = "300"
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
pp.pprint(dict(os.environ))

# Parameters
DB_SCHEMA = get_db_config()
request_models = get_request_models()
request_validators = get_request_validators()
resources_to_create = get_resources_to_create()

# Get all lambda functions which are found in the subfolders of the folder /lambdas
print("Locate all lambda functions to deploy in folder /lambdas ...")
LAMBDA_FUNCTIONS_TO_DEPLOY = [function_folder for function_folder in os.listdir("./lambdas") if os.path.isdir("./lambdas/" + function_folder)]
print(f"Found lambda functions to deploy: {', '.join(LAMBDA_FUNCTIONS_TO_DEPLOY)}")

LAMBDA_ROLE = "arn:aws:iam::000000000000:role/lambda-role" # given by localstack

APIG_NAME = os.environ['APIG_TAG']
APIG_TAG_ID = os.environ['APIG_TAG_ID']
APIG_WAIT = int(os.environ['APIG_WAIT'])

# Create clients
lambda_client = boto3.client("lambda")
dynamo_client = boto3.client("dynamodb")
apig_client = boto3.client("apigateway")

###
# First of all, fetch the api_id to work with. Wait for some time until the API service has started and created
###
# API Gateway deployment

api_id = None

print(f"Try to find API created by apig-main, waiting for max {APIG_WAIT} seconds ...")
timestamp_start_finding_api_id = datetime.now()
print(f"Trying to find api_id, start at {timestamp_start_finding_api_id}")
while True:
    try:
        api_id = deploy_utils.find_api_id_by_tag(apig_client = apig_client, tag_key = APIG_TAG_ID, tag_value = APIG_NAME)
        break
    except ValueError as value_error:
        tmp_timestamp = datetime.now()
        print(f"Error trying to find api_id, current time {tmp_timestamp}, wait and try again ...")
        time.sleep(5)
        if (tmp_timestamp - timestamp_start_finding_api_id).seconds > APIG_WAIT:
            print(f"Exceeded waiting time, stop trying to find the api")
            break

if not api_id:
    raise ValueError(f"api_id for API with tag {APIG_TAG_ID} : {APIG_NAME} not found, abort")
else:
    print("api_id found")
print(f"Use api_id {api_id}")


###
# Dynamo DB deployment  
print("Dynamo DB deployment ...")
for table in DB_SCHEMA:
    try:
        dynamo_client.create_table(**table)
    except botocore.exceptions.ClientError as client_error:
        if client_error.response['Error']['Code'] == "ResourceInUseException":
            print(f"Dynamo DB {table['TableName']} already exists, skip and use that one")
            pass
        else:
            # If the error is not a conflict (already exists), raise the error
            print(f"Dyanmo DB {table['TableName']} some other error occured, abort")
            print(client_error.response['message'])
            raise client_error
    print("Dynamo DB created or already existing")


###
# Lambda deployment
print("Lambda deployment, pass if function already exists ...")
lambdas = {}
# Get all existing lambda functions
try:
    existing_lambdas = lambda_client.list_functions()['Functions']
    existing_lambdas_names = [l['FunctionName'] for l in existing_lambdas]
except KeyError as key_error:
    print(f"No Functions found in list_functions, try to deploy lambdas anyways")
for lambda_function_to_create in LAMBDA_FUNCTIONS_TO_DEPLOY:

    # If lambda_function_to_create already exists, inform and skip
    if lambda_function_to_create in existing_lambdas_names:
        print(f"Lambda function {lambda_function_to_create} already exists, use that one and skip")
        # Update the lambdas dict with the already existing lambda
        existing_lambda_arn = existing_lambdas[existing_lambdas_names.index(lambda_function_to_create)]['FunctionArn']
        lambdas[lambda_function_to_create] = existing_lambda_arn
        continue

    lambdas[lambda_function_to_create] = deploy_utils.deploy_lambda(
        lambda_client = lambda_client,
        fct_name = lambda_function_to_create,
        env = {"Role" : LAMBDA_ROLE}
    )
    print(f"Waiting over, function {lambda_function_to_create} is ready")
print("Lambda deployment done")


###
# API Gateway deployment
print("API Gateway ...")

###
# Request Models
print(f"Create api request models, pass if model already exists ...")
for model_name, model in request_models.items():
    try:
        apig_client.create_model(
            restApiId = api_id,
            name = model_name,
            schema = json.dumps(model['model_spec']),
            contentType = model['contentType']        
        )
    except botocore.exceptions.ClientError as client_error:
        if client_error.response['Error']['Code'] == "ConflictException":
            print(f"Model {model_name} already exists, skip")
            pass
        else:
            # If the error is not a conflict (already exists), raise the error
            print(f"Model {model_name} some other error occured, abort")
            print(client_error.response['message'])
            raise client_error

###
# Request Validators
print("Create api request validators, pass if validator name already exists ...")
# Get all existing validators
try:
    existing_validators = apig_client.get_request_validators(restApiId = api_id)['items']
    existing_validators_names = [validator['name'] for validator in existing_validators]
except KeyError as key_error:
    print(f"No items found in get_request_validators, try to deploy validators anyways")

api_validators = {}
for validator_name, validator in request_validators.items():
    
    # If validator_name already exists, inform and skip
    if validator_name in existing_validators_names:
        print(f"Validator {validator_name} already exists, use that one and skip")
        # Update the api_validators dict with the already existing validator
        existing_validator_id = existing_validators[existing_validators_names.index(validator_name)]['id']
        api_validators[validator_name] = existing_validator_id
        continue

    # Create validator
    validator = apig_client.create_request_validator(
        restApiId = api_id,
        name = validator_name,
        validateRequestBody = validator['validateRequestBody'],
        validateRequestParameters = validator['validateRequestParameters']
    )
    api_validators[validator_name] = validator['id']

###
# Methods and Integrations
print("Create method and integration ...")

# resource_type, resource_list = list(resources_to_create.items())[0]

for resource_type, resource_list in resources_to_create.items():
    
    print(f"create {resource_type} ... ")
    
    depth = 0
    current_resource = list(resource_list)[0]
    parent_res_id = None # Init to None, meaning the root should be the first parent resource id

    # Each element in resource_list is a dict with fields path, methods_for_that_path and children.
    # As long as there are elements to deploy, keep deploying until all nested elements are deployed

    while True:
        current_path = current_resource['path']
        current_methods = current_resource['methods_for_that_path']
        current_children = current_resource['children_resources']
        print(f"create resource {current_path}")
        
        # parent_id is the currently set parent resrouce id. If None, we create at root
        current_res_id = deploy_utils.create_resource(
            apig_client = apig_client,
            api_id = api_id,
            parent_id = parent_res_id,
            resource_path = current_path
        )

        print(f"create {len(current_methods)} methods for path {current_path}")
        for i,i_method_dict in enumerate(current_methods):
            i_method = i_method_dict['method']
            i_lambda_fct = i_method_dict['lambda_fct']
            print(f"create method {i_method} with function {i_lambda_fct}")
            
            # Get the lambda arn
            lambda_arn = lambdas[i_lambda_fct]

            # Create method and integration
            apig_new_method, apig_new_integration = deploy_utils.add_lambda_method_and_integration_to_resource(
                apig_client = apig_client,
                lambda_client = lambda_client,
                api_id = api_id,
                resource_id = current_res_id,
                lambda_arn = lambda_arn,
                method = i_method,
                requestParameters = i_method_dict.get('requestParameters',{}), # This is optional, if empty pass empty dict
                requestModels = i_method_dict.get('requestModels',{}), # This is optional, if empty pass empty dict
                requestValidatorId = api_validators['bodyOnly'] # The default bodyOnly validator
            )

        # If there are children, set the child to the current_resource, remember the previous children
        # Also, set the current_res_id as the parent_res_id
        # Add one to depth
        if current_children:
            depth += 1
            print(f"Move to children of {current_path}")
            parent_res_id = current_res_id
            previous_children = current_children.copy()
            current_resource = previous_children.pop(0)
        # If there are no children, keep the parent_res_id, and check if there are other children in the previous children
        else:
            # If there are previous children, use the same parent_res_id
            if previous_children:
                current_resource = previous_children.pop(0)
            # If we exhausted all children from previous we reduce depth by 1
            # Then we break from the while loop and move to the next resource_type
            else:
                depth -= 1
                break

###
# Deployment
print("Create api deployment ...")
deploy_utils.deploy_api(
    apig_client = apig_client,
    api_id = api_id,
    stage_name = os.environ['APIG_STAGE']
)
print("API Gateway deployment update done")

print("API Gateway done")