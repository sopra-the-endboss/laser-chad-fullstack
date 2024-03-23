"""
Deploy one API Gateway service which is available to all other backend microservices
Deploy no resources, only create the service and a deployment with a stage
"""
import re
import os
import boto3
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--
# FOR MANUAL RUNING ONLY - DO NOT RUN IF IN A DOCKER CONTAINER
IN_DOCKER = os.environ.get('AM_I_IN_A_DOCKER_CONTAINER', False)

if not IN_DOCKER:
    os.chdir("./apig-main")
    # Also set all AWS env vars, point to running localstack container not in a docker-compose network
    os.environ['AWS_DEFAULT_REGION']='us-east-1'
    os.environ['AWS_ENDPOINT_URL']='https://localhost.localstack.cloud:4566' # For manual, use the default localstack url
    os.environ['AWS_ACCESS_KEY_ID']='fakecred' # Sometimes boto3 needs credentials
    os.environ['AWS_SECRET_ACCESS_KEY']='fakecred' # Sometimes boto3 needs credentials
    os.environ['APIG_TAG'] = "apig-main"
    os.environ['APIG_TAG_ID'] = "API_TAG_ID"
    os.environ['APIG_STAGE'] = "PROD"
# FOR MANUAL RUNING ONLY END
##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--

print("This is the environment")
pp.pprint(dict(os.environ))

APIG_NAME = os.environ['APIG_TAG']
APIG_TAG_ID = os.environ['APIG_TAG_ID']

# Create client
apig_client = boto3.client("apigateway")

###
# API Gateway
print("API Gateway create ...")

apig_created = apig_client.create_rest_api(
    name = APIG_NAME,
    tags={APIG_TAG_ID:APIG_NAME}
)

print(f"API Gateway with id {apig_created['id']} created")

def get_base_url(apig_client, api_id: str, stage_name:str, protocol: str = "http") -> str:
    """
    According to localstack documentation build the url in an alternative format
    """

    if not protocol:
        protocol="http"
    
    url_base = "{protocol}://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_"

    endpoint = os.environ['AWS_ENDPOINT_URL']
    # Strip protocol
    endpoint = re.sub(r"^.*\/\/","",endpoint)
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")

    url = url_base.format(protocol = protocol, endpoint = endpoint, api_id = api_id, stage_name = stage_name,)
    
    return url