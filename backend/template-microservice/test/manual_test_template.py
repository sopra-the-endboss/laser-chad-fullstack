"""
Running the file when docker compose up is running:
to copy the file to a running container to run and run it right away in the docker network
run this from a terminal in the host machine, not a container
docker cp backend/template-microservice/test/manual_test_template.py template-microservice-debugger:/app && docker exec template-microservice-debugger /bin/sh -c "python manual_test_template.py"
"""

import boto3
import os
import simplejson as json
import requests
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--
# FOR MANUAL RUNING ONLY
IN_DOCKER = os.environ.get('AM_I_IN_A_DOCKER_CONTAINER', False)

if not IN_DOCKER:
    print("Running script in non-docker mode")
    os.chdir("./template-microservice")
    # Also set all AWS env vars, point to running localstack container not in a docker-compose network
    os.environ['AWS_DEFAULT_REGION']='us-east-1'
    os.environ['AWS_ENDPOINT_URL']='https://localhost.localstack.cloud:4566' # For manual, use the default localstack url
    os.environ['AWS_ACCESS_KEY_ID']='fakecred' # Sometimes boto3 needs credentials
    os.environ['AWS_SECRET_ACCESS_KEY']='fakecred' # Sometimes boto3 needs credentials
    os.environ['APIG_TAG'] = "apig-main"
    os.environ['APIG_TAG_ID'] = "API_TAG_ID"
    os.environ['APIG_STAGE'] = "PROD"
    os.environ['PROTOCOL'] = "https"
    os.environ['APIG_WAIT'] = "300"
# FOR MANUAL RUNING ONLY END
##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--

import deploy_utils

# Create clients
lambda_client = boto3.client("lambda")
apig_client = boto3.client("apigateway")

api_stage_name = os.environ['APIG_STAGE']
api_tag_id = os.environ['APIG_TAG_ID']
api_id_to_seach = os.environ['APIG_TAG']

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
# Send requests to test routes /template-microservice GET und POST

# if in manual mode, get corresponding protocol, in dockermode is None, defaults to http
PROTOCOL_TO_USE = os.getenv("PROTOCOL", None)

# Test OPTIONS for all resources
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
print(f"Sending OPTIONS to {url}, verify 200")
response = requests.options(url)
print(response.text)


# Send request to test GET - should return empty
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send requests to test POST
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = {"template-microservice-key-1":"dummyvalue1", "template-microservice-key-2":"dummyvalue1"}
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Send requests to test GET - should return with one object
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send requests to test POST with invalid payload. Missing the second key -> 400
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = {"template-microservice-key-1":"dummyvalue1"}
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Send requests to test POST with invalid payload. Not string -> 400
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = {"template-microservice-key-1":"dummyvalue1", "template-microservice-key-2":42}
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Send requests to test POST with invalid payload. Not number -> 400
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = {"template-microservice-key-1":"dummyvalue1", "template-microservice-key-2":"dummyvalue1", "template-microservice-key-numeric":"notanumber"}
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Send requests to test POST with payload with additional field, valid -> 200, we have an entry with an additional field
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = {"template-microservice-key-1":"dummyvalue3", "template-microservice-key-2":"dummyvalue3", "additional field":"additionalvalue"}
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Check with GET
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
pp.pprint(response.json())

# Send POST to test the number attribute. Send valid POST
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = {"template-microservice-key-1":"dummyvalue3", "template-microservice-key-2":"dummyvalue3", "template-microservice-key-numeric":42}
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Check with GET
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
pp.pprint(response.json())



###
# Send requests to test /template-microservice/{id}
# 1 - GET without match
# 2 - POST item one and two
# 3 - GET all items
# 4 - GET with path without match
# 5 - GET wiht path with match

key_1_to_match = "valid_item_one"
item_one_to_write = {"template-microservice-key-1":key_1_to_match, "template-microservice-key-2":"key_1_to_match"}
item_two_to_write = {"template-microservice-key-1":"valid_item_two", "template-microservice-key-2":"valid_item_two"}
key_1_not_to_match = "invalid_item"

# Send GET without match, key_1_to_match does not yet exist
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
url = url + f"/{key_1_to_match}" # Add our specific id
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send POST to write two valid items
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
payload = item_one_to_write
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)

payload = item_two_to_write
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)

# Send request to test GET all items
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
pp.pprint(response.json())

# Send GET without match, key_1 does not exist
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
url = url + f"/{key_1_not_to_match}" # Add our specific id
print(f"Sending GET to {url}")
response = requests.get(url)
pp.pprint(response.json())

# Send GET with match, id does exist
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "template-microservice", protocol=PROTOCOL_TO_USE)
url = url + f"/{key_1_to_match}" # Add our specific id
print(f"Sending GET to {url}")
response = requests.get(url)
pp.pprint(response.json())