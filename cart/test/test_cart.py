"""
Running the file when docker compose up is running:
to copy the file to a running container to run and run it right away in the docker network
run this from a terminal in the host machine, not a container
docker cp template-microservice/test/test_cart.py cart-debugger:/app && docker exec cart /bin/sh -c "python test_cart.py"
"""

import boto3
import botocore
import os
import simplejson as json
import requests
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
TableName = "cart-db"
dynamo_resource = boto3.resource("dynamodb")
dynamo_table = dynamo_resource.Table(TableName)

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
# Send requests to test routes

# if in manual mode, get corresponding protocol, in dockermode is None, defaults to http
PROTOCOL_TO_USE = os.getenv("PROTOCOL", None)

# TODO: Write tests




# ###
# # Test Dynamo DB

# # Play around with querying Dynamo DB
# entry1 = {'userId' : "userA", 'products' : {"userA_prod1","userA_prod2"}}
# entry2 = {'userId' : "userB", 'products' : {"userB_prod1","userB_prod2","userB_prod3"}}
# dynamo_table.put_item(
#     Item = entry1,
#     ReturnValues = "NONE"
# )
# dynamo_table.put_item(
#     Item = entry2,
#     ReturnValues = "NONE"
# )
# dynamo_table.scan().get('Items', [])
# response_match = dynamo_table.get_item(
#     # Key = {"userId":"userA"}
#     Key = {"userId":"asdf"}
# )
# response_match_items = response_match.get("Item",None)
# response_match_products = response_match_items['products']

# # Test put_item with condition that the key does not yet exist
# entry3 = {'userId' : "userC", 'products' : {}}
# condition_expression = "attribute_not_exists(userId)"
# try:
#     dynamo_table.put_item(Item = entry1, ConditionExpression=condition_expression)
# except botocore.exceptions.ClientError as client_error:
#     print(client_error.response)
#     if client_error.response['Error']['Code'] == "ConditionalCheckFailedException":
#         print(f"Condition failed")
#         pass
#     else:
#         # If the error is not a conflict (already exists), raise the error
#         print(f"Some other error occured")
#         print(client_error.response['message'])
#         raise client_error


# dynamo_table.put_item(Item = entry3, ConditionExpression=condition_expression)

# response_match = dynamo_table.get_item(
#     # Key = {"userId":"userA"}
#     Key = {"userId":"userC"}
# )
# response_match_items = response_match.get("Item",None)
# response_match_products = response_match_items['products']


"""
EXAMPLE

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
"""

###
# Send GET - should return empty -> 404
url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "cart/1", protocol=PROTOCOL_TO_USE)
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.status_code)
print(response.text)

###
# Send POST invalid -> 400
invalid_payloads = []
invalid_payloads.append({"wrong_key":["prod1"]})
invalid_payloads.append({"products":"thisshouldbeanarray"})
invalid_payloads.append({"products":[1,2,3]})
invalid_payloads.append({"products":["1"]})
invalid_payloads.append({"products":[{"asdf":"asdf"}]})
invalid_payloads.append({"products":[{"productId":1}]})
invalid_payloads.append({"products":[{"productId":"valid_prod", "qty":"notanumber"}]})

for payload in invalid_payloads:
    url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "cart/1", protocol=PROTOCOL_TO_USE)
    print(f"Sending POST to {url} with payload {payload}")
    response = requests.post(url, json = payload)
    print(response.status_code)
    print(response.text)


###
# Send POST valid -> 200
valid = {"products":[{"productId":"valid_prod", "qty":1}]}

payload = valid

url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "cart/1", protocol=PROTOCOL_TO_USE)
print(f"Sending POST to {url} with payload {payload}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)


###
# Send POST with identical item -> 409
payload = valid

url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = "cart/1", protocol=PROTOCOL_TO_USE)
print(f"Sending POST to {url} with payload {payload}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)


###
# Send POST with empty body, but valid -> 200
empty_but_valid = {"products":[]}
new_user = 2

payload = empty_but_valid

url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{new_user}", protocol=PROTOCOL_TO_USE)
print(f"Sending POST to {url} with payload {payload}")
response = requests.post(url, json = payload)
print(response.status_code)
print(response.text)


###
# Send PUT with invalid  -> 400
invalid_payloads = []
invalid_payloads.append({"wrong_key":"adsf"})
invalid_payloads.append({"productId":1})

user = 1

for payload in invalid_payloads:
    url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
    print(f"Sending PUT to {url} with payload {payload}")
    response = requests.put(url, json = payload)
    print(response.status_code)
    print(response.text)


###
# Send PUT valid already existing -> 200
# Should increase valid_prod to 2
valid = {"productId":"valid_prod"}
user = 1

payload = valid

url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
print(f"Sending PUT to {url} with payload {payload}")
response = requests.put(url, json = payload)
print(response.status_code)
print(response.text)


###
# Send PUT valid new productId -> 200
# Should increase new_prod to 1
new_and_valid = {"productId":"new_prod"}
user = 1

payload = new_and_valid

url = deploy_utils.get_resource_path(apig_client, api_id, stage_name = api_stage_name, resource_path = f"cart/{user}", protocol=PROTOCOL_TO_USE)
print(f"Sending PUT to {url} with payload {payload}")
response = requests.put(url, json = payload)
print(response.status_code)
print(response.text)
