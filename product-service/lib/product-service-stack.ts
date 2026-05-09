import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cr from "aws-cdk-lib/custom-resources";
import * as path from "path";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Products table
    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'products',

      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Stocks table
    const stocksTable = new dynamodb.Table(this, 'StocksTable', {
      tableName: 'stocks',

      partitionKey: {
        name: 'product_id',
        type: dynamodb.AttributeType.STRING,
      },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // CloudFormation outputs
    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: productsTable.tableName,
    });

    new cdk.CfnOutput(this, 'StocksTableName', {
      value: stocksTable.tableName,
    });

    const lambdaConfig = {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../dist/lambda")),
    };

    const seedDataLambda = new lambda.Function(this, "seedData", {
      ...lambdaConfig,
      handler: "seedData.handler",
    });

    productsTable.grantWriteData(seedDataLambda);
    stocksTable.grantWriteData(seedDataLambda);

    const seedProvider = new cr.Provider(this, "SeedProvider", {
      onEventHandler: seedDataLambda,
    });

    new cdk.CustomResource(this, "SeedDataResource", {
      serviceToken: seedProvider.serviceToken,
    });

    const getProductsList = new lambda.Function(this, "getProductsList", {
      ...lambdaConfig,
      handler: "getProductsList.handler",
    });

    const getProductsById = new lambda.Function(this, "getProductsById", {
      ...lambdaConfig,
      handler: "getProductsById.handler",
    });

    const createProduct = new lambda.Function(this, "createProduct", {
      ...lambdaConfig,
      handler: "createProduct.handler",
    });

    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST", "OPTIONS"],
      },
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", new apigateway.LambdaIntegration(getProductsList));
    productsResource.addMethod("POST", new apigateway.LambdaIntegration(createProduct));

    productsResource
      .addResource("{productId}")
      .addMethod("GET", new apigateway.LambdaIntegration(getProductsById));

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "Product Service API Gateway URL",
    });
  }
}
