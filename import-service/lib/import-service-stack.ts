import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, "ImportBucket", {
      bucketName: "rsschool-import-service-bucket",
      cors: [{
        allowedMethods: [s3.HttpMethods.PUT],
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaConfig = {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist/lambda")),
    };

    const importProductsFile = new lambda.Function(this, "importProductsFile", {
      ...lambdaConfig,
      handler: "importProductsFile.handler",
      environment: {
        BUCKET_NAME: importBucket.bucketName,
      },
    });

    importBucket.grantPut(importProductsFile);

    const api = new apigateway.RestApi(this, "ImportServiceApi", {
      restApiName: "Import Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
      },
    });

    const importResource = api.root.addResource("import");
    importResource.addMethod("GET", new apigateway.LambdaIntegration(importProductsFile));

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "Import Service API Gateway URL",
    });
  }
}
