# to copy the file to a running container to run and run it right away
# run this from a terminal in the host machine, not a container
# docker cp test\test_apig.py shopprofile-debugger:/app && docker exec shopprofile-debugger /bin/sh -c "python test_apig.py"

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



# Create clients
apig_client = boto3.client("apigateway")

# APIG_TAG_ID=API_TAG_ID
# APIG_TAG=apig_shopprofiles

api_tag_id = "API_TAG_ID"
api_id_to_seach = "apig_shopprofiles"

api_id = find_api_id_by_tag(
    tag_key = api_tag_id,
    tag_value = api_id_to_seach
)

print(apig_client.get_rest_apis())

# print(api_id)
# pp.pprint(apig_client.get_rest_api(restApiId=api_id))

# pp.pprint(apig_client.get_resources(restApiId = api_id))

# url = get_resource_path(
#     api_id = api_id,
#     resource_path = "/listShopprofiles"
# )

# print(url)

# # Send requests to test
# response = requests.get(url)
# print(response.text)
