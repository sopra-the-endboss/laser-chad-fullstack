"""
Deploy one Lambda function to handle all OPTIONS API integrations.
All microservices rely on this function and use it for all API integrations
"""

import os
import boto3
import botocore
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

import deploy_utils

LAMBDA_ROLE = "arn:aws:iam::000000000000:role/lambda-role" # given by localstack

# This is the function all other microservices will look for
OPTIONS_LAMBDA_FUNCTION = os.environ['OPTIONS_LAMBDA_FUNCTION']
print(f"This is the Lambda function in the environemnt that should be deployed: {OPTIONS_LAMBDA_FUNCTION}")

# Get all lambda functions which are found in the subfolders of the folder /lambdas
print("Locate the OPTIONS lambda function to deploy in folder /lambdas ...")
LAMBDA_FUNCTIONS_TO_DEPLOY = [function_folder for function_folder in os.listdir("./lambdas") if os.path.isdir("./lambdas/" + function_folder)]
print(f"Found lambda function to deploy: {', '.join(LAMBDA_FUNCTIONS_TO_DEPLOY)}")

if not OPTIONS_LAMBDA_FUNCTION in LAMBDA_FUNCTIONS_TO_DEPLOY:
    print(f"Error, lambda function {OPTIONS_LAMBDA_FUNCTION} should be deployed, is the naming of the lambda folder wrong? Abort")
    raise ValueError

lambda_client = boto3.client("lambda")

# Deploy the function
lambda_function_deployed = deploy_utils.deploy_lambda(
    lambda_client = lambda_client,
    fct_name = OPTIONS_LAMBDA_FUNCTION,
    env = {"Role" : LAMBDA_ROLE}
)
print(f"Waiting over, function {OPTIONS_LAMBDA_FUNCTION} is ready")
