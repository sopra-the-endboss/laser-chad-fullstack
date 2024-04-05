from flask import Flask
from flask_cors import CORS
import re
import boto3
from datetime import datetime
import time
import os

def find_api_id_by_tag(apig_client, tag_key:str, tag_value:str) -> str:
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

def create_apig_base_url(apig_client, api_id: str, stage_name:str, protocol: str = "http") -> str:
    """
    According to localstack documentation build the url in an alternative format
    """

    if not protocol:
        protocol="http"
    
    url = "{protocol}://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_"

    endpoint = os.environ['AWS_ENDPOINT_URL']
    # Strip protocol
    endpoint = re.sub(r"^.*\/\/","",endpoint)
    # localhost, not localstack
    endpoint = re.sub(r"localstack","localhost",endpoint)
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")

    url = url.format(protocol = protocol, endpoint = endpoint, api_id = api_id, stage_name = stage_name,)
    
    return url

APIG_NAME = os.environ['APIG_TAG']
APIG_TAG_ID = os.environ['APIG_TAG_ID']
APIG_WAIT = int(os.environ['APIG_WAIT'])
APIG_STAGE = os.environ['APIG_STAGE']

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
        api_id = find_api_id_by_tag(apig_client = apig_client, tag_key = APIG_TAG_ID, tag_value = APIG_NAME)
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

apig_base_url = create_apig_base_url(apig_client, api_id=api_id, stage_name=APIG_STAGE)

app = Flask(__name__)
CORS(app)

@app.route('/apig_base_url')
def get_apig_base_url():
    return apig_base_url

def shutdown_server():
    func = flask.request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    
@app.get('/shutdown')
def shutdown():
    shutdown_server()
    return 'Server shutting down...'


app.run(debug=True, host='0.0.0.0')

print("Endpoint sharing apig base url started ...")

