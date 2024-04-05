# apig-main

This service provides the API Gateway used by all other backend microservices.  
Its purpose is to deploy the API Gateway with the given configurations in config and the tag specified in docker-compose.  
This allows all other microservices to find its API_ID and URL via the deploy_utils functions

## Workflow
apig-main creates the API, it does not deploy it.  
To deploy an API, it must contain methods.  
Hence, each microservice will update the API (adding resources, methods, integrations) and then deploys/redeploys it, always to the same stage.