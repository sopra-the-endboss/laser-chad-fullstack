import os
import re
import zipfile

def deploy_lambda(lambda_client, fct_name: str, env: dict[str, str]) -> str:
    """
    Wrapper to create a lambda function, assume tmp_handler.py file in root dir, consisting of handler function called handler
    Error if lambda function already exists

    Returns the ARN of the created lambda function
    """
    print(f"Deploying function {fct_name} ...")
    zip_name = f'lambdas/{fct_name}/handler.zip'
    with zipfile.ZipFile(zip_name, mode='w') as tmp:
        complete_file_path = f'lambdas/{fct_name}/handler.py'
        tmp.write(complete_file_path, arcname=os.path.basename(complete_file_path))

    response_lambda_create = lambda_client.create_function(
        FunctionName = fct_name,
        Role = env['Role'],
        Handler = "handler.handler",
        Runtime = "python3.10",
        Code = {'ZipFile': open(zip_name, 'rb').read()},
        Environment={
            'Variables': env
            }
        )
    
    # Wait until the lambda is active
    lambda_client.get_waiter("function_active_v2").wait(FunctionName = fct_name)

    return response_lambda_create['FunctionArn']

def create_resource(apig_client, api_id: str, parent_id: str, resource_path: str) -> str:
    """
    Wrapper for creating a resource

    Arguments:
        api_id : ID of the API to create the resource in
        parent_id : ID of the resource that the resource_path is appended to. If None defaults to root
        resource_path : The 'unique' part of the path that will be appended to parent_id path

    Return:
        id of resource created
    """

    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Check parent_id
    if not parent_id:
        # Use root if nothing is specified
        parent_id = [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']][0]
    elif not parent_id in [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']]:
        raise ValueError(f"parent resource id {parent_id} not found")
    
    # Add resource
    apig_new_resource = apig_client.create_resource(
        restApiId = api_id,
        parentId = parent_id,
        pathPart = resource_path
    )
    
    return apig_new_resource['id']

def add_lambda_method_and_integration_to_resource(
        apig_client,
        lambda_client,
        api_id: str,
        resource_id: str,
        lambda_arn: str,
        method: str,
        requestParameters: dict[str,bool],
        requestModels: dict[str,str],
        requestValidatorId: str
    ) -> tuple[dict, dict]:
    """
    Wrapper to add a method to an existing resource
    """
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Check resource_id
    if not resource_id in [res['id'] for res in apig_client.get_resources(restApiId = api_id)['items']]:
        raise ValueError(f"resource id {resource_id} not found")

    # Check ARN of the desired lambda function to integrate
    if not lambda_arn in [function_def['FunctionArn'] for function_def in lambda_client.list_functions()['Functions']]:
        raise ValueError(f"lambda arn {lambda_arn} not found")

    # Put a HTTP method to a resource
    apig_new_method = apig_client.put_method(
        restApiId = api_id,
        resourceId = resource_id,
        httpMethod = method,
        authorizationType = "NONE",
        apiKeyRequired = False,
        requestParameters = requestParameters,
        requestModels = requestModels,
        requestValidatorId = requestValidatorId
    )

    # Put an integration
    apig_new_integration = apig_client.put_integration(
        restApiId = api_id,
        resourceId = resource_id,
        httpMethod = method,
        type = "AWS_PROXY", # I think thats given if we use lambda
        integrationHttpMethod = "POST", # I think this is always POST, we forward the request to the lambda function
        uri = f"arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/{lambda_arn}/invocations"
    )

    return apig_new_method, apig_new_integration

def deploy_api(apig_client, api_id: str, stage_name: str):
    """
    Deploy an api
    """
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    # Deploy the API
    _ = apig_client.create_deployment(
        restApiId = api_id,
        stageName = stage_name
    )

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

def get_resource_path(apig_client, api_id: str, stage_name:str, resource_path: str, protocol: str = "http") -> str:
    """
    According to localstack documentation build the url in an alternative format
    """

    if not protocol:
        protocol="http"
    
    url_base = "{protocol}://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_/{resource_path}"

    endpoint = os.environ['AWS_ENDPOINT_URL']
    # Strip protocol
    endpoint = re.sub(r"^.*\/\/","",endpoint)
    
    # Check API ID
    if not api_id in [x['id'] for x in apig_client.get_rest_apis()['items']]:
        raise ValueError(f"api {api_id} not found")
    
    url = url_base.format(
        protocol = protocol,
        endpoint = endpoint,
        api_id = api_id,
        stage_name = stage_name,
        resource_path = resource_path
    )

    return url
