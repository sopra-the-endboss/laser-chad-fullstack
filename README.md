This is the main project repository. It consists of a React frontend with multiple composable serverless microservices and a backend with serveral AWS components.

# Deployment

**NOTE**  
- The deployment was not tested with all new Macbook M1 and M2 chip architectures. If the deployment via pulled images fails, refer to the [general deployment section](#general-deployment) and build and run the containers from the dockerfiles yourself.    
- Also, after starting the containers, wait for 2 minutes to allow all containers to run and exit. This time is needed to start localstack and deploy all the backend services that need to be active in order to run properly.


## Deployment for Deliverable 2
In order to simplify deployment for the deliverable, we uploaded all neccesary images to the docker hub and created a dedicated docker compose yaml. This speeds up build time. You can simply run
```
docker compose -f docker-compose_deliverable2.yml up -d --build
```
This should pull all pre-built images and start the containers. To shut it down run
```
docker compose -f docker-compose_deliverable2.yml down
```
Should this fail, see the next [section](#general-deployment) for a general deployment where the images are built from the dockerfiles.

## General deployment
To deploy the application by building it from the dockerfiles, simply run 
```
docker compose up -d --build
```
from a terminal in the root folder. The `--build` flag ensures a proper rebuild of the images, not using any old cached versions.
To shut it down run
```
docker compose down
```


## Deployment order
For the deployment, we use Docker and Docker compose. The [compose file](./docker-compose.yml) manages the overall deployment of the frontend and backend. To reduce code duplication, we use a [environment file](./.env) to set some global varialbes used for the deployment.  
The order of deployment works as follows and can be inferred from the different services deployed in the compose yaml:
1. A localstack instance is deployed which will host all the mocked AWS services
2. Independent from it, a frontend container is launched to run the frontend compontents
3. The apig-main service is launched first, creating the API Gateway needed by the backend
4. The options_lambda_function is deployed. This ensures that all OPTIONS routes have the neccesary Lambda function available. This only depends on the localstack container
5. The apig-id-share service depends on the apig-main service. As soon as the API Gateway is created and available, this service sets up the Flask server which enables the frontend to find the URL on which to send its requests.
6. Now all "real" backend services like cart and product-microservice and its respective debugger containers are started. The order ensures that all services make sure that the API Gateway is up and running and the OPTIONS Lambda function is deployed before they attempt to deploy their Lambda functions, databases and integrations.


# Architecture
![Alt text](./ASE%20Architecture%20Diagram.drawio.svg?raw=true "Title")

# Frontend
TODO: Descripe Amplify setup better

Authentication setup:
AWS Cognito and Amplify are used for Authentication.

To setup Amplify Cli run this in command line (Windows)
curl -sL https://aws-amplify.github.io/amplify-cli/install-win -o install.cmd && install.cmd

To pull amplify project:
amplify pull --appId d47a6guqh1kks --envName staging

Docker compose up to runs

# Backend
The backend uses a microservice approach where each isolated component provides a certain part of the functionality which in its sum composes all neccesary backend services. All services provide their functionality through HTTP API endpoints. All planned and implemented services and its endpoints are described in the [API specification](api_specification.xlsx).   

There are some common infrastructure and components which are used by all microservices. Those are the API Gateway and a Flask server which serves the API routes to the frontend components. Additionally, there are some common templates and functions that are used by all microservices, see [template-microservice](./backend/template-microservice/) and its README.  

All microservices use the AWS services API Gateway, Lambda and Dynamo DB. They are developed with localstack and are supposed to run primarily with localstack, but with few changes could also be deployed to AWS.

For the description of a general microservice architecture and the speicific services, see the READMEs in the backend folder.

# Tests and Codequality
For code quality, we use Qodana and Github Actions. Each push on main os run through the static code quality analizyer.
For testing, all tests are located in the [tests folder](./tests/), mirroring the frontend/backend layout of the main repository. For the backend, pytest is used, for the frontent we use Jest. As with code quality, all tests are run via Github Actions and test reports are generated.
