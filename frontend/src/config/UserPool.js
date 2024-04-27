import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = new CognitoUserPool({
  UserPoolId: "eu-north-1_itzGrLoRL",
  ClientId: "68r37ihomeqvje07ajr4v5748a",
});

export default poolData;
