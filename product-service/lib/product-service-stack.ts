import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaConfig = {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist/lambda")),
    };

    const getProductsList = new lambda.Function(this, "getProductsList", {
      ...lambdaConfig,
      handler: "getProductsList.handler",
    });

    const getProductsById = new lambda.Function(this, "getProductsById", {
      ...lambdaConfig,
      handler: "getProductsById.handler",
    });

    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
      },
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", new apigateway.LambdaIntegration(getProductsList));

    productsResource
      .addResource("{productId}")
      .addMethod("GET", new apigateway.LambdaIntegration(getProductsById));
  }
}
