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

# Set env variables
os.environ['AWS_DEFAULT_REGION']='us-east-1'
os.environ['AWS_ENDPOINT_URL']='http://localhost.localstack.cloud:4566'
os.environ['AWS_ACCESS_KEY_ID']='fakecredentials'
os.environ['AWS_SECRET_ACCESS_KEY']='fakecredentials'

lambda_client = boto3.client("lambda")
apig_client = boto3.client("apigateway")
TAG_ID = "API_TAG_ID" # This is the name of the tag we're looking for to identify our API later


def deploy_lambda(fct_name: str):
    """
    Wrapper to create a lambda function, assume tmp_handler.py file in root dir, consisting of handler function called handler
    Error if lambda function already exists
    """
    ZIP_NAME = "tmp_lambda.zip"
    # zip the lambda handler function file to create a deployment package
    with zipfile.ZipFile(ZIP_NAME, mode='w') as tmp:
        tmp.write("tmp_lambda.py")
    response_lambda_create = lambda_client.create_function(
        FunctionName = fct_name,
        Role = "arn:aws:iam::000000000000:role/lambda-role", # given by localstack
        Handler = "tmp_lambda.handler",
        Runtime = "python3.10",
        Code = {'ZipFile': open(ZIP_NAME, 'rb').read()}
        )
    return response_lambda_create['FunctionArn']
    
def create_api(api_name: str, api_tag: str, tag_id: str):
    """
    Wrapper to create API Gateway
    Each API created must have a tag in the form of <tag_id>:<api_tag>
    """

    # Create the REST API
    apig_rest_api = apig_client.create_rest_api(
        name = api_name,
        tags={tag_id:api_tag}
    )
    return apig_rest_api

def create_resource(api_id: str, parent_id: str, resource_path: str) -> str:
    """
    Wrapper for creating a resource

    Arguments:
        api_id : ID of the API to create the resource in
        parent_id : ID of the resource that the resource_path is appended to. If None defaults to root
        resource_path : The 'unique' part of the path that will be appended to parent_id path

    Return:
        id of resource created
    """

    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Check parent_id
    if not parent_id:
        # Use root if nothing is specified
        parent_id = [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']][0]
    elif not parent_id in [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']]:
        raise ValueError(f"parent resource id {parent_id} not found")
    
    # Add resource
    apig_new_resource = apig_client.create_resource(
        restApiId = api_id,
        parentId = parent_id,
        pathPart = resource_path
    )
    
    return apig_new_resource['id']

def add_lambda_method_and_integration_to_resource(
        api_id: str,
        resource_id: str,
        lambda_arn: str,
        method: str,
        requestParameters: dict[str,bool],
        requestModels: dict[str,str],
        requestValidatorId: str
    ):
    """
    Wrapper to add a method to an existing resource
    """

    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Check resource_id
    if not resource_id in [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']]:
        raise ValueError(f"resource id {resource_id} not found")

    # Get the ARN of the desired lambda function to integrate
    if not lambda_arn in [function_def['FunctionArn'] for function_def in lambda_client.list_functions()['Functions']]:
        raise ValueError(f"lambda arn {lambda_arn} not found")

    # Put a HTTP method to a resource
    apig_new_method = apig_client.put_method(
        restApiId = api_id,
        resourceId = resource_id,
        httpMethod = method,
        authorizationType = "NONE",
        apiKeyRequired = False,
        requestParameters = requestParameters,
        requestModels = requestModels,
        requestValidatorId = requestValidatorId
    )

    # Put an integration
    apig_new_integration = apig_client.put_integration(
        restApiId = api_id,
        resourceId = resource_id,
        httpMethod = method,
        type = "AWS_PROXY", # I think thats given if we use lambda
        integrationHttpMethod = "POST", # I think this is always POST, we forward the request to the lambda function
        uri = f"arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/{lambda_arn}/invocations"
    )

    return apig_new_method, apig_new_integration

def deploy_api(api_id: str):
    """
    Deploy an api
    NOTE: stage_name is always equal to "PROD"
    """
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Deploy the API
    apig_deployment = apig_client.create_deployment(
        restApiId = api_id,
        stageName = "PROD"
    )

    return apig_deployment

def find_api_id_by_tag(tag_key:str, tag_value:str) -> str:
    """
    Find from all deployed apis the ID where the api has a tag with value tag_key and value tag_value
    Throws error if multiple found
    Throw error if none found

    Returns
        str with the API ID
    """

    api_ids_found = []
    for api_item in apig_client.get_rest_apis()['items']:
        api_item_tags = api_item['tags']
        if tag_key in api_item_tags:
            if api_item_tags[tag_key] == tag_value:
                api_ids_found.append(api_item['id'])
    
    if not api_ids_found:
        raise ValueError(f"No API ID found with tag_key {tag_key} and tag_value {tag_value}")
    
    if len(api_ids_found) > 1:
        raise ValueError(f"Multiple API ID found with tag_key {tag_key} and tag_value {tag_value}")
    
    return api_ids_found[0]

def get_resource_path(api_id: str, resource_path: str) -> str:
    """
    According to localstack documentation build the url
    """ 
    url_base = "http://{api_id}.execute-api.{endpoint}/{stage_name}{resource_path}"

    endpoint = os.environ['AWS_ENDPOINT_URL']
    # Strip protocol
    endpoint = re.sub(r"^.*\/\/","",endpoint)
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Get stage_name, which is ALWAYS equal to PROD
    stage_name = "PROD"

    url = url_base.format(
        api_id = api_id,
        endpoint = endpoint,
        stage_name = stage_name,
        resource_path = resource_path
    )

    return url



###
# Deploy
tag_to_use = "3"
lambda_arn = deploy_lambda(fct_name=f"lambda_test_{tag_to_use}")

request_models = {
    "postSomething": {
        "model_spec": {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "title": "postSomething",
            "type" : "object",
            "required" : [ "post1"],
            "properties" : {
                "post1" : {
                    "type" : "string"
                }
            }
        },
        "contentType" : "application/json"
    }
}
pp.pprint(request_models)

request_validators = {
    "bodyOnly" : {
        "name":"bodyOnly",
        "validateRequestBody":True,
        "validateRequestParameters":False
    }
}

paths_and_methods_to_create = {
    'getSomething' : [
        {
            "path":"getSomething",
            "method":"GET",
            "lambda_arn":lambda_arn
        },
        {
            "path":"{getSomething_id}",
            "method":"GET",
            "lambda_arn":lambda_arn
        },
    ],
    'postSomething' : [
        {
            "path":"postSomething",
            "method":"POST",
            "lambda_arn":lambda_arn,
            "requestModels":{"application/json":"postSomething"}
        },
    ]
}
pp.pprint(paths_and_methods_to_create)

response_create_api = create_api(f"api_test_{tag_to_use}", f"tag_{tag_to_use}", TAG_ID) # mit tag
# response_create_api = create_api(f"api_test_{tag_to_use}") # ohne tag
pp.pprint(response_create_api)
api_id = response_create_api['id']

# For the API, create all the models
model_name, model = list(request_models.items())[0]
for model_name, model in request_models.items():
    apig_client.create_model(
        restApiId = api_id,
        name = model_name,
        schema = json.dumps(model['model_spec']),
        contentType = model['contentType']        
    )

# Also create validators and store in dict with name:id
api_validators = {}
validator_name, validator = list(request_validators.items())[0]
for validator_name, validator in request_validators.items():
    validator = apig_client.create_request_validator(
        restApiId = api_id,
        name = validator_name,
        validateRequestBody = validator['validateRequestBody'],
        validateRequestParameters = validator['validateRequestParameters']
    )
    api_validators[validator_name] = validator['id']

# Create resources, for each elemetn in paths_and_methods_to_create
# Each element contains a tuple with PATH,METHOD,LAMBDA_ARN
# Each subsequent tuple uses the newly created resource of the previous as parent resource
resource_type = "postSomething" ; resource_list = dict(paths_and_methods_to_create.items())[resource_type]
for resource_type, resource_list in paths_and_methods_to_create.items():
    print(f"create {resource_type} ... ")
    i = 0
    for i,resource_mapping in enumerate(resource_list):
        if i == 0:
            tmp_parent_res_id = None
        # if i == 1:
            # resource_mapping = resource_list[i]
            # break
        tmp_parent_res_id = create_resource(
            api_id = api_id,
            parent_id = tmp_parent_res_id,
            resource_path=resource_mapping['path']
        )
        resource_mapping['resource_id'] = tmp_parent_res_id
        _,_ = add_lambda_method_and_integration_to_resource(
            api_id = api_id,
            resource_id=tmp_parent_res_id,
            lambda_arn = resource_mapping['lambda_arn'],
            method = resource_mapping['method'],
            requestParameters = resource_mapping.get('requestParameters',{}), # This is optional, if empty pass empty dict
            requestModels = resource_mapping.get('requestModels',{}), # This is optional, if empty pass empty dict
            requestValidatorId = api_validators['bodyOnly'] # The default bodyOnly validator
        )

response_deploy_api = deploy_api(api_id = api_id)




# Now generate URLs with a given tag
path_to_build_url_for = "/postSomething"
api_id_to_build_url_for = find_api_id_by_tag(tag_key = TAG_ID, tag_value = f"tag_{tag_to_use}")

# Look at available resources
pp.pprint(apig_client.get_resources(restApiId = api_id_to_build_url_for)['items'])
[res['path'] for res in apig_client.get_resources(restApiId = api_id_to_build_url_for)['items']]

copy(get_resource_path(api_id = api_id_to_build_url_for , resource_path=path_to_build_url_for))
url_built = get_resource_path(api_id = api_id_to_build_url_for , resource_path=path_to_build_url_for)
url_built

# Send requests to test
response = requests.get(
    get_resource_path(
        api_id = find_api_id_by_tag(tag_key = TAG_ID, tag_value = f"tag_{tag_to_use}"),
        resource_path = "/getSomething"
    )
)
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