# template-microservice

A minimal example of a backend service setup. Consists of three components
- Dynamo DB
- Lambda functions
- API Gateway

NOTE: This example shows the creation and the deployment of the API Gateway amonst other. In the actual architecture, there will be one "global" API Gateway, and an actual microservice will only create resources, methods and integrations. For the sake of completion, the creation and deployment part of the code is included as well.  

The workflow is: A [deploy script](deploy.py) which uses [deploy utilities](deploy_utils.py) is run, where all services are deployed. If successful, one Dynamo DB, multiple Lambda functions and an API Gateway will be deployed. To test the services, one can run the files in the test folder which list available resources deployed and make some example calls to the API Gateway.   

The service can be run in two ways: In a "debug" localstack container or in the realistic way thorugh [docker-compose](../docker-compose.yml).

## Debug through simple localstack container
This way, the deploy script itself can be tested and be run line by line. The progress of the deployment can be tracked in the localstack UI through the browser (https://app.localstack.cloud/dashboard).
- Needs a host machine with localstack installed.
- Run `localstack start`. There should be a localstack-main container being started
- Now you can run the [deploy script](deploy.py) line by line from the root directory, verifying on each step in the localstack UI if the services are deployed correctly. Additionally, you can check the logs of the localstack container.
- The deploy script checks if it runs in a docker container or locally and sets the environment variables for the AWS/localstack services accordingly (it sets `https://localhost.localstack.cloud:4566` as the endpoint).

## Run with docker-compose
This is the simulation of the "real" service.
- `docker compose up -d --build` to start the containers. The following services (frontend and other services ignored) are started:
    - localstack
    - template-microservice. This container runs upon creation the [deploy script](deploy.py) which sets up all the AWS services on the localstack container
    - template-microservice-debugger. Same as template-microservice, but keeps running. Can be used to `docker exec -it template-microservice-debugger /bin/sh` and test a curl on the deployed APIs which are available in the localstack container of the docker-compose network.
- Wait (ca 30sec) until the template-microservice container exits, this means that the deployment is over (one can check the logs in the container, it should print some progress statements during the deployment).
- Now you can test the deployed services with the scripts in the test folder. What you do is 1) copy the script from your host machine to the running debugger container and 2) execute the script. You will see the output in the console.
- Each test script contains the linux command in the header of the file, it looks something like ``

## The API endpoint
The API endpoint that is deployed and will be reachable for other services like the frontend is constructed in the script [deploy utils](deploy_utils.py) method `find_api_id_by_tag` and `get_resource_path` and follows the pattern
- `"http://{endpoint}/restapis/{api_id}/{stage_name}/_user_request_/{resource_path}"`
- The endpoint is in this case the name and port of the service that hosts localstack, in this case `localstack:4566` if run from docker-compose, or `https://localhost.localstack.cloud:4566` if localstack is started via `localstack start`.
- The api_id is an ID which is assigned upon API creation. It is found via a tag with name `APIG_TAG_ID` and value `APIG_TAG` specified in the docker-compose.yml
- stage_name is a constant PROD, specified in the docker-compose.yml. There is no sense in having different stages for our project.
- resource_path is the path of the API that should be called and is linked to a Lambda function. In this example it is something like `template-microservice` or `template-microservice/{template-microservice-key-1}`and is specified in the `path` field of the [resources config file](config/resources_to_create.json)
