"""
to copy the file to a running container to run and run it right away
run this from a terminal in the host machine, not a container
docker cp test/test_shopprofile_shopemail_get.py shopprofile-debugger:/app && docker exec shopprofile-debugger /bin/sh -c "python test_shopprofile_shopemail_get.py"
"""

import boto3
import os
import re
import json
import requests
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--
# FOR MANUAL RUNING ONLY

IN_DOCKER = os.environ.get('AM_I_IN_A_DOCKER_CONTAINER', False)

if not IN_DOCKER:
    print("Running script in non-docker mode")
    os.chdir("./backend")
    # Also set all AWS env vars, point to running localstack container not in a docker-compose network
    os.environ['AWS_DEFAULT_REGION']='us-east-1'
    os.environ['AWS_ENDPOINT_URL']='https://localhost.localstack.cloud:4566' # For manual, use the default localstack url
    os.environ['AWS_ACCESS_KEY_ID']='fakecred' # Sometimes boto3 needs credentials
    os.environ['AWS_SECRET_ACCESS_KEY']='fakecred' # Sometimes boto3 needs credentials
    os.environ['APIG_TAG'] = "apig_shopprofiles"
    os.environ['APIG_TAG_ID'] = "API_TAG_ID"
    os.environ['APIG_STAGE'] = "PROD"
    os.environ['PROTOCOL'] = "https"
# FOR MANUAL RUNING ONLY END
##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--

import deploy_utils

# Create clients
lambda_client = boto3.client("lambda")
apig_client = boto3.client("apigateway")

api_stage_name = "PROD"
api_tag_id = "API_TAG_ID"
api_id_to_seach = "apig_shopprofiles"

api_id = deploy_utils.find_api_id_by_tag(
    apig_client,
    tag_key = api_tag_id,
    tag_value = api_id_to_seach
)

print("ALL APIS FOUND:\n")
print(apig_client.get_rest_apis()['items'])
print("-----------------")

print(f"ALL DEPLOYMENTS TO {api_id} FOUND:\n")
print(apig_client.get_deployments(restApiId=api_id)['items'])
deployment_id = apig_client.get_deployments(restApiId=api_id)['items'][0]['id']
print("-----------------")

print(f"ALL STAGES TO {api_id} AND DEPLOYMENT {deployment_id} FOUND:\n")
print(apig_client.get_stages(restApiId=api_id, deploymentId = deployment_id))
print("-----------------")

print(f"ALL RESOURCES TO {api_id} FOUND:\n")
pp.pprint(apig_client.get_resources(restApiId = api_id)['items'])
resources_id = [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']]
print("-----------------")

print(f"ALL LAMBDA FUNCTION TO {api_id} FOUND:\n")
pp.pprint(lambda_client.list_functions())
print("-----------------")


###
# Send requests
# 1 - GET without match
# 2 - POST item one and two
# 3 - GET all items
# 4 - GET with path without match
# 5 - GET wiht path with match

# if in manual mode, get corresponding protocol, in dockermode is None, defaults to http
PROTOCOL_TO_USE = os.getenv("PROTOCOL", None)

shopemail_to_match = "valid_item_one"
item_one_to_write = {"shopemail":shopemail_to_match, "shoppassword":"valid_password_one"}
item_two_to_write = {"shopemail":"valid_item_two", "shoppassword":"valid_password_two"}
shopemail_not_to_match = "invalid_item"

# Send GET without match, since DB is empty
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "shopprofile", protocol=PROTOCOL_TO_USE)
url = url + f"/{shopemail_not_to_match}" # Add our specific shopemail
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send POST to write two valid items
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "shopprofile", protocol=PROTOCOL_TO_USE)
payload = item_one_to_write
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)

payload = item_two_to_write
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
# print(response.text) # dont show POST response

# Send request to test GET all items
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "shopprofile", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send GET without match, shopemail does not exist
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "shopprofile", protocol=PROTOCOL_TO_USE)
url = url + f"/{shopemail_not_to_match}" # Add our specific shopemail
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send GET with match, shopemail does exist
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "shopprofile", protocol=PROTOCOL_TO_USE)
url = url + f"/{shopemail_to_match}" # Add our specific shopemail
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)
