import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("getProductsById invoked, pathParameters:", event.pathParameters);

  try {
    const productId = event.pathParameters?.productId;

    const [productResult, stockResult] = await Promise.all([
      client.send(new GetItemCommand({ TableName: "products", Key: { id: { S: productId! } } })),
      client.send(new GetItemCommand({ TableName: "stocks", Key: { product_id: { S: productId! } } })),
    ]);

    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const product = unmarshall(productResult.Item);
    const stock = stockResult.Item ? unmarshall(stockResult.Item) : { count: 0 };

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ...product, count: stock.count }),
    };
  } catch (e) {
    console.error("getProductsById error:", e);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
