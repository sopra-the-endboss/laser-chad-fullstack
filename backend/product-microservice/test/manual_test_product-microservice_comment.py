"""
Running the file when docker compose up is running:
to copy the file to a running container to run and run it right away in the docker network
run this from a terminal in the host machine, not a container
docker cp backend/product-microservice/test/manual_test_product-microservice_comment.py product-microservice-debugger:/app && docker exec product-microservice-debugger /bin/sh -c "python manual_test_product-microservice_comment.py"
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
    os.chdir("./product-microservice")
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

#api_stage_name = os.environ['APIG_STAGE']
api_stage_name = "PROD"
#api_tag_id = os.environ['APIG_TAG_ID']
api_tag_id = "API_TAG_ID"
#api_id_to_seach = os.environ['APIG_TAG']
api_id_to_seach = "apig-main"

api_id = deploy_utils.find_api_id_by_tag(
    apig_client,
    tag_key = api_tag_id,
    tag_value = api_id_to_seach
)

# print("ALL APIS FOUND:\n")
# print(apig_client.get_rest_apis()['items'])
# print("-----------------")

# print(f"ALL DEPLOYMENTS TO {api_id} FOUND:\n")
# print(apig_client.get_deployments(restApiId=api_id)['items'])
# deployment_id = apig_client.get_deployments(restApiId=api_id)['items'][0]['id']
# print("-----------------")

# print(f"ALL STAGES TO {api_id} AND DEPLOYMENT {deployment_id} FOUND:\n")
# print(apig_client.get_stages(restApiId=api_id, deploymentId = deployment_id))
# print("-----------------")

# print(f"ALL RESOURCES TO {api_id} FOUND:\n")
# pp.pprint(apig_client.get_resources(restApiId = api_id)['items'])
# resources_id = [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']]
# print("-----------------")

# print(f"ALL LAMBDA FUNCTION TO {api_id} FOUND:\n")
# pp.pprint(lambda_client.list_functions())
# print("-----------------")


###
# Send requests to test routes /product-microservice GET und POST

# if in manual mode, get corresponding protocol, in dockermode is None, defaults to http
PROTOCOL_TO_USE = os.getenv("PROTOCOL", None)

# Send request to test GET - should return empty
url = deploy_utils.get_resource_path(
  apig_client, api_id, stage_name = api_stage_name, resource_path = "product-comment", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
print(json.loads(response.text)[0])
# for element in response.text:
#   pp.pprint(json.loads(element))

# Send requests to test POST
url = deploy_utils.get_resource_path(
    apig_client,
    api_id,
    stage_name = api_stage_name,
    resource_path = "product-comment/product_id_1", protocol=PROTOCOL_TO_USE)
payload =   {
    "user": "user_1",
    "user_id": "user_id_1",
    "rating": 5,
    "review": "review_1",
    "title": "title_1",
    "date": "date_1",
    "review_id": "review_id_1"
  }
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)

# Send requests to test GET - should return with containing the new object
url = deploy_utils.get_resource_path(
  apig_client,
  api_id,
  stage_name=api_stage_name,
  resource_path="product-comment/product_id_1",
  protocol=PROTOCOL_TO_USE
)
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)


# # Send POST invalid, missing field
url = deploy_utils.get_resource_path(
    apig_client,
    api_id,
    stage_name = api_stage_name,
    resource_path = "product-comment/product_id_1", protocol=PROTOCOL_TO_USE)
payload =   {
    "user": "user_1",
    "user_id": "user_id_1",
    "rating": "shouldBeANumber",
    # "review": "review_1",
    "title": "title_1",
    "date": "date_1",
    "review_id": "review_id_1"
  }
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)
