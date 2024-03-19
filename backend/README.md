A minimal example of a backend service setup. Consists of three components
- API Gateway
- Lambda functions
- Dynamo DB

The example should simulate a minimal shopprofile Dynamo DB which list all entries (lambda function list_shopprofiles) and put an entry (lambda function write_shopprofile)  
The workflow is as follows:
- `docker compose up -d --build` to start the containers. The following services (frontend and other services ignored) are started:
    - localstack
    - shopprofile. This container runs upon creation the [deploy script](deploy.py) which sets up all the AWS services on the localstack container
    - shopprofile-debugger. Same as shopprofile but keeps running. Can be used to `docker exec -it shopprofile-debugger /bin/sh` and test a curl on the deployed API
- Wait (ca 30sec) until the shopprofile container exits, this means that the deployment is over (can check the logs in the container)

## Test Lambda functions manually
To test the invocation of the Lambda functions itself, the [test invocation script](test/test_lambda_invoke.py) can be run in a UNIX temrinal with the docker command listed in the beginning of the file. It copies the file into the running shopprofile-debugger and runs it to see the invocations of the lambda functions

## Test API endpoint
The API endpoint that is deployed and will be reachable for other services like the frontend is constructed in the script [deploy utils](deploy_utils.py) method `find_api_id_by_tag` and `get_resource_path` and follows the pattern
- `"http://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_/{resource_path}"`
- The endpoint is in this case the name and port of the service that hosts localstack, in this case localstack:4566
- The api_id is an ID which is assigned upon API creation. It is found via a tag with name `APIG_TAG_ID` and  value `apig_shopprofile` specified in the docker-compose.yaml
- stage_name is a constant PROD, specified in the docker-compose.yaml
- resource_path is the path of the API that should be called and is linked to a Lambda function. In this example it is either `/listShopprofiles`, `/listShopprofiles/{shopprofile_email}` or `/writeShopprofile` with GET or POST

To actually test the API endpoints, the [test api script](test/test_apig.py) contains the code to send requests to de deployed API and print the results. Same as with the invocations, the command at the beginning of the script can be run in a UNIX terminal which will run the script on the shopprofile-debugger and print the responses from the service.

To obtain an URL see the file `test_apig.py`.

## TODO
- Rename routes to conform to HTTP standards
- Finalize deploy_utils.py so that all methods are contained there
- Route /listShopprofiles/{shopemail} is not yet set up with the Lambda function. The route does exist, but it simply calls the same Lambda function list_shopprofiles which does not yet use the paramter {shopemail}
- Once finalized remove all tmp_XXX files
