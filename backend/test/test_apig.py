"""
to copy the file to a running container to run and run it right away
run this from a terminal in the host machine, not a container
docker cp test\test_apig.py shopprofile-debugger:/app && docker exec shopprofile-debugger /bin/sh -c "python test_apig.py"
"""

import boto3
import os
import re
import json
import requests
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

import deploy_utils

# Create clients
lambda_client = boto3.client("lambda")
apig_client = boto3.client("apigateway")

api_stage_name = "PROD"
api_tag_id = "API_TAG_ID"
api_id_to_seach = "apig_shopprofiles"

api_id = deploy_utils.find_api_id_by_tag(
    tag_key = api_tag_id,
    tag_value = api_id_to_seach
)

print("ALL APIS FOUND:\n")
print(apig_client.get_rest_apis())
print("-----------------")

print(f"ALL DEPLOYMENTS TO {api_id} FOUND:\n")
print(apig_client.get_deployments(restApiId=api_id))
print("-----------------")

print(f"ALL RESOURCES TO {api_id} FOUND:\n")
pp.pprint(apig_client.get_resources(restApiId = api_id))
print("-----------------")

print(f"ALL LAMBDA FUNCTION TO {api_id} FOUND:\n")
pp.pprint(lambda_client.list_functions())
print("-----------------")


# Send requests to test GET - should return empty
url = deploy_utils.get_resource_path(api_id, stage_name = api_stage_name, resource_path = "asdf")
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# # Send requests to test POST
# url = deploy_utils.get_resource_path(api_id, stage_name = api_stage_name, resource_path = "shopprofile")
# payload = {"shopemail":"test2", "shoppassword":"test2"}
# print(f"Sending POST to {url} with payload {json.dumps(payload)}")
# response = requests.post(url, json = payload)
# print(response.text)

# # Send requests to test GET - should return with one object
# url = deploy_utils.get_resource_path(api_id, stage_name = api_stage_name, resource_path = "shopprofile")
# print(f"Sending GET to {url}")
# response = requests.get(url)
# print(response.text)