import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new lambda.Function(this, "basicAuthorizer", {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist/lambda")),
      handler: "basicAuthorizer.handler",
      environment: {
        nkomiljon: process.env.nkomiljon!,
      },
    });

    const api = new apigateway.RestApi(this, "AuthorizationServiceApi", {
      restApiName: "Authorization Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
      },
    });

    const authorizer = new apigateway.TokenAuthorizer(this, "BasicAuthorizer", {
      handler: basicAuthorizer,
      identitySource: apigateway.IdentitySource.header("Authorization"),
    });

    const authResource = api.root.addResource("auth");
    authResource.addMethod("GET", new apigateway.MockIntegration({
      integrationResponses: [{ statusCode: "200" }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: { "application/json": "{\"statusCode\": 200}" },
    }), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      methodResponses: [{ statusCode: "200" }],
    });

    new cdk.CfnOutput(this, "BasicAuthorizerArn", {
      value: basicAuthorizer.functionArn,
      description: "Basic Authorizer Lambda ARN",
      exportName: "BasicAuthorizerArn",
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "Authorization Service API Gateway URL",
    });
  }
}
