# options_lambda_function

This is the backendservice that creates the lambda handler for all OPTIONS calls.  
This creates the lambda function that will be used by all other microservices when they refer to the lambda function `options_lambda_function`.  
This handler is the same for all OPTIONS calls in the whole project and simply retunrs `statusCode: 200` and the correct headers to allow CORS.  
Refer to [this documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html) to learn about CORS and AWS.

## API
For a documentation of the API refer to the [Wiki](https://github.com/sopra-the-endboss/laser-chad-fullstack-wiki/wiki)