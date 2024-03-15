A minimal example of a backend service setup. Consists of three components
- API Gateway
- Lambda functions
- Dynamo DB

The example should simulate a minimal shopprofile Dynamo DB which list all entries (lambda function list_shopprofiles) and put an entry (lambda function write_shopprofile)  
The workflow is as follows:
- `docker compose up -d --build` to start the containers. The following services (frontend and other services ignored) are started:
    - localstack
    - shopprofile. This container runs the `deploy.py` script which sets up all the AWS services on the localstack container
    - shopprofile-debugger. Same as shopprofile but keeps running. Can be used to `docker exec -it shopprofile-debugger /bin/sh` and test a curl on the deployed API
- Wait (ca 30sec) until the shopprofile container exits, this means that the deployment is over (can check the logs in the container)

## Test lambda functions manually
To test the functionality, the script `test/test_XX.py` can be run with the docker command listed in the beginning of the script. It copies the file into the running shopprofile-debugger and runs it to see the invocations of the lambda functions or the API calls to the API Gateway.

## Test API endpoint
The API endpoint is constructed in the method `deploy_utils.py` method `find_api_id_by_tag` and `get_resource_path` and follows the pattern
- `"http://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_/{resource_path}"`

To obtain an URL see the file `test_apig.py`.





## TODO
- The invocation returns curenntly "Unable to find path xxx" since I renamed the resources_to_create.json routes...