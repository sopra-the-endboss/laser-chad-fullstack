# to copy the file to a running container to run and run it right away
# run this from a terminal in the host machine, not a container
# docker cp test\test_apig.py product-debugger:/app && docker exec product-debugger /bin/sh -c "python test_apig.py"

import boto3
import os
import re
import json
import requests
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

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
    According to localstack documentation build the url in an alternative format
    """ 
    url_base = "http://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_/{resource_path}"

    endpoint = os.environ['AWS_ENDPOINT_URL']
    # Strip protocol
    endpoint = re.sub(r"^.*\/\/","",endpoint)
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Get stage_name, which is ALWAYS equal to PROD
    stage_name = "PROD"

    url = url_base.format(
        endpoint = endpoint,
        api_id = api_id,
        stage_name = stage_name,
        resource_path = resource_path
    )

    return url



# Create clients
apig_client = boto3.client("apigateway")

api_tag_id = "API_TAG_ID"
api_id_to_seach = "apig_shopprofiles"

api_id = find_api_id_by_tag(
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


# Send requests to test GET - should return empty
url = get_resource_path(api_id, resource_path = "listProducts")
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)

# Send requests to test POST
url = get_resource_path(api_id, "writeProduct")
payload = {
    "product_id": 1,
    "product": "Apple iPhone 15 Pro"
  }
print(f"Sending POST to {url} with payload {json.dumps(payload)}")
response = requests.post(url, json = payload)
print(response.text)

# Send requests to test GET - should return with one object
url = get_resource_path(api_id, resource_path = "listProducts")
print(f"Sending GET to {url}")
response = requests.get(url)
print(response.text)