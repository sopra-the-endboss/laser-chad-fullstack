"""
Running the file when docker compose up is running:
to copy the file to a running container to run and run it right away in the docker network
run this from a terminal in the host machine, not a container
docker cp backend/cart/test/manual_test_cart.py cart-debugger:/app && docker exec cart-debugger /bin/sh -c "python manual_test_cart.py"
"""

import boto3
import os
import requests
import simplejson as json
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--
# FOR MANUAL RUNING ONLY - DO NOT RUN IF IN A DOCKER CONTAINER
IN_DOCKER = os.environ.get('AM_I_IN_A_DOCKER_CONTAINER', False)

if not IN_DOCKER:

    os.getcwd()
    os.chdir("./template-microservice")
    import deploy_utils
    os.chdir("../")
    
    # Also set all AWS env vars, point to running localstack container not in a docker-compose network
    os.environ['AWS_DEFAULT_REGION']='us-east-1'
    os.environ['AWS_ENDPOINT_URL']='https://localhost.localstack.cloud:4566' # For manual, use the default localstack url
    os.environ['AWS_ACCESS_KEY_ID']='fakecred' # Sometimes boto3 needs credentials
    os.environ['AWS_SECRET_ACCESS_KEY']='fakecred' # Sometimes boto3 needs credentials
    os.environ['APIG_TAG'] = "apig-main"
    os.environ['APIG_TAG_ID'] = "API_TAG_ID"
    os.environ['APIG_STAGE'] = "PROD"
    os.environ['APIG_WAIT'] = "300"

    os.chdir("./cart")

# FOR MANUAL RUNING ONLY END
##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--

import deploy_utils

# Create clients
TableName = "cart-table"
dynamo_resource = boto3.resource("dynamodb")
dynamo_table = dynamo_resource.Table(TableName)

lambda_client = boto3.client("lambda")
apig_client = boto3.client("apigateway")
dynamo_client = boto3.client("dynamodb")

api_stage_name = os.environ['APIG_STAGE']
api_tag_id = os.environ['APIG_TAG_ID']
api_id_to_seach = os.environ['APIG_TAG']

api_id = deploy_utils.find_api_id_by_tag(
    apig_client,
    tag_key = api_tag_id,
    tag_value = api_id_to_seach
)

print(f"Table count: {dynamo_table.item_count}")
scan_response = dynamo_client.scan(TableName = "cart-table")
scan_items = scan_response['Items']
while 'LastEvaluatedKey' in scan_response:
    response = dynamo_client.scan(
        TableName='cart-table',
        ExclusiveStartKey=response['LastEvaluatedKey']
    )
    scan_items.extend(response['Items'])
pp.pprint(scan_items)

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


# ###
# # Send requests to test routes

# # if in manual mode, get corresponding protocol, in dockermode is None, defaults to http
# PROTOCOL_TO_USE = os.getenv("PROTOCOL", None)

# user = "1"

# # Test OPTIONS for all resources
# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending OPTIONS to {url}, verify 200")
# response = requests.options(url)
# print(response.text)

# ###
# # Send GET - should return empty -> 404
# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending GET to {url}")
# response = requests.get(url)
# print(response.status_code)
# print(response.text)

# ###
# # Send POST with arbitrary payload, should be ok, no model, but subsequent calls should be conflict
# # 200
# # then 409
# post_payloads = []
# post_payloads.append({"somearbitarypayload":["prod1"]})
# post_payloads.append({"someOtherarbitarypayload":123})

# for payload in post_payloads:
#     url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
#     print(f"Sending POST to {url} with payload {payload}")
#     response = requests.post(url, json = payload)
#     print(response.status_code)
#     print(response.text)

# ###
# # PUT BATCH
# # Send PUT BATCH with arbitrary payload, must contain field "product"
# put_batch_payload = {
#     "products" : [
#         {"product_id":"2", "brand":"Apple", "quantity":2},
#         {"product_id":"3", "brand":"Intel", "quantity":4}
#     ]
# }
    
# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}/batch", protocol=PROTOCOL_TO_USE)
# print(f"Sending PUT to {url} with payload {put_batch_payload}")
# response = requests.put(url, json = put_batch_payload)
# print(response.status_code)
# print(response.text)

# # Send GET to check Batch
# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending GET to {url}")
# response = requests.get(url)
# print(response.status_code)
# print(response.text)

# ###
# # Send PUT with invalid  -> 400
# invalid_payloads = []
# invalid_payloads.append({"wrong_key":"adsf"})
# invalid_payloads.append({"product_id":99})

# user = 1

# for payload in invalid_payloads:
#     url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
#     print(f"Sending PUT to {url} with payload {payload}")
#     response = requests.put(url, json = payload)
#     print(response.status_code)
#     print(response.text)


# ###
# # Send PUT valid already existing -> 200
# # First call should create prod
# # Second call should increase qty to 2
# user = 1
# valid = {"product_id":"product_one"}
# payload = valid

# for i in range(2):
#     print(f"{i+1} call PUT")
#     url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
#     print(f"Sending PUT to {url} with payload {payload}")
#     response = requests.put(url, json = payload)
#     print(response.status_code)
#     print(response.text)


# ###
# # Send PUT valid new product_id -> 200
# # Should set  new_prod to qty 1
# new_and_valid = {"product_id":"product_two"}
# user = 1

# payload = new_and_valid

# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending PUT to {url} with payload {payload}")
# response = requests.put(url, json = payload)
# print(response.status_code)
# print(response.text)



# ###
# # Send DELETE product not in cart -> 200, do nothing
# valid_not_exisiting = {"product_id":"product_not_in_cart"}
# user = 1
# payload = valid_not_exisiting

# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending DELETE to {url} with payload {payload}")
# response = requests.delete(url, json = payload)
# print(response.status_code)
# print(response.text)

# ###
# # Send DELETE product from 1 to 0 -> 200. remove prod
# delete_1_to_0 = {"product_id":"product_two"}
# user = 1
# payload = delete_1_to_0

# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending DELETE to {url} with payload {payload}")
# response = requests.delete(url, json = payload)
# print(response.status_code)
# print(response.text)


# ###
# # Send DELETE product from 2 to 1 -> 200. decrease qty
# delete_2_to_1 = {"product_id":"product_one"}
# user = 1
# payload = delete_2_to_1

# url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
# print(f"Sending DELETE to {url} with payload {payload}")
# response = requests.delete(url, json = payload)
# print(response.status_code)
# print(response.text)