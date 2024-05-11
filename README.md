This is the main project repository. It consists of a React frontend with multiple composable serverless microservices and a backend with serveral AWS components.  
For the Wiki, see [the Wiki repository](https://github.com/sopra-the-endboss/laser-chad-fullstack-wiki)

# Deployment
See below for instructions on how to start the containers. After the proper startup including some minutes to let the containers set up all the services, the project can be reached via `localhost:3000`.

**NOTES AND KNOWN BUGS FOR DEPLOYMENT**  
- The deployment was not tested with all new Macbook M1 and M2 chip architectures. If the deployment via pulled images fails, refer to the [general deployment section](#general-deployment) and build and run the containers from the dockerfiles yourself.    
- Also, after starting the containers, wait for 2 minutes to allow all containers to run and exit. This time is needed to start localstack and deploy all the backend services that need to be active in order to run properly.
- It can happen, when the images are pulled for the first time, that the deployment fails due to the localstack container not being ready. In the rare case, a simple `docker compose down` followed by a `docker compose up` solves the problem.
- Upon the first start of the frontend when trying to reach localhost:3000, it can happen that the backend is not yet ready and responds too slow to the startup call where all products are fetched. In this case, an error is displayed "The service cannot be reached. Failed to load products!". If this happens, a simple refresh of the page will solve the issue.


## Deployment for Final Submission
In order to simplify deployment for the deliverable, we established a CI integraiton which automatically uploads the latest images to the docker hub. See section Continuous Integration. In order to use the latests images, simply run the following line from a terminal in the root directory:
```
docker compose -f docker-compose_final_submission.yml up -d --build
```
This should pull all pre-built images and start the containers. To shut it down run
```
docker compose -f docker-compose_final_submission.yml down
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
6. Now all "real" backend services like cart and product-microservice (and its respective debugger containers if enabled in the compose file) are started. The order ensures that all services make sure that the API Gateway is up and running and the OPTIONS Lambda function is deployed before they attempt to deploy their Lambda functions, databases and integrations.


# Architecture
![Alt text](./ASE%20Architecture%20Diagram-Architecture%20Overview_1.drawio.svg?raw=true "Title")


# Frontend
The frontend follows the react-js framework. Material ui is used for styling.
**Authentication:**
AWS Cognito and Amplify are used for user registration and user authentication. After sign-up, Cognito sends a verification challenge to the provided user email.

**State management:**
Redux stores ensure client-sided state persistance. 
Components like the shopping cart, sync the redux state to the backend on loggout to ensure overall persistence.

Refer to the frontend README or the index.html generated with Jsdoc in the /frontend/doc folder for further information.

# Backend
The backend uses a microservice approach where each isolated component provides a certain part of the functionality which in its sum composes all neccesary backend services. All services provide their functionality through HTTP API endpoints.

There are some common infrastructure and components which are used by all microservices. Those are the API Gateway and a Flask server which serves the API routes to the frontend components. Additionally, there are some common templates and functions that are used by all microservices, see [template-microservice](./backend/template-microservice/) and its README.  

All microservices use the AWS services API Gateway, Lambda and Dynamo DB. They are developed with localstack and are supposed to run primarily with localstack, but with few changes could also be deployed to AWS.

For the description of a general microservice architecture and the speicific services, see the READMEs in the backend folder.

# Tests and Codequality
For code quality, we use Qodana and Github Actions. Each push on main os run through the static code quality analyzer.
For testing, all backend tests are located in the [tests folder](./tests/), mirroring the frontend/backend layout of the main repository. For the backend, pytest is used, for the frontent we use Jest. As with code quality, all tests are run via Github Actions and test reports are generated and can be view within Qodana Cloud UI.  
Refer to the READMEs of the backend and frontend respectively for further information about testing.

# Continuous Integration
With every push on main, Github Actions builds and pushes the docker images to our public Docker Hub Container registry with the following [GitHub action](.github/workflows/docker.yml). The tag used for the final submission is `final-submission`. The uploaded images can be accessed [here](https://hub.docker.com/u/laserchads).
