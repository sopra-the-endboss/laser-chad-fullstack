This is the main project repository. It consists of a React Frontend with multiple composable serverless microservices.

<img src="[https://github.com/sopra-the-endboss/laser-chad-fullstack/blob/58f8c236581647a0855b5c862ad2ae6cb3e5fd07/ASE%20Architecture%20Diagram-Architecture%20Overview.drawio.svg](https://github.com/sopra-the-endboss/laser-chad-fullstack/blob/19743b8f216545fedfeabf3be0cefd56b8f15315/ASE%20Architecture%20Diagram.drawio.svg)"  width="600" height="500">

A Microservice consist of three components:
- API Gateway
- Lambda functions
- Dynamo DB

Authentication setup:
AWS Cognito and Amplify are used for Authentication.

To setup Amplify Cli run this in command line (Windows)
curl -sL https://aws-amplify.github.io/amplify-cli/install-win -o install.cmd && install.cmd

To pull amplify project:
amplify pull --appId d47a6guqh1kks --envName staging

Docker compose up to run
