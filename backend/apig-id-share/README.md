# apig-id-share
This service provides a minimal Flask server which broadcasts the ID of the API Gateway crated by the microservice apig-main.  
The server simply offers one route `/apig_base_url` which returns the ID of the API Gateway.
This is neccessary to share the concrete URL of the API Gateway with the frontend services, so that those frontend services can communicate with the backend services via HTTP.
The reason for this is the setup with localstack which does not enable the creation of a static URL. This means that each new deployment of the API Gateway will change the URL, hence each new deployment will also need a new API Gateway ID Share

## Workflow
apig-main creates the API.
Afterwards, this service api-id-share retrieves the concrete ID and builds the URL which can be used to send requests to the Gateway.  
Then the flask server is deployed on port 5000, returning the built URL upon GET request.