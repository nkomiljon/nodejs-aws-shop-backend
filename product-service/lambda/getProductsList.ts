import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandler = async () => {
  console.log("getProductsList invoked");

  try {
    const [productsResult, stocksResult] = await Promise.all([
      client.send(new ScanCommand({ TableName: "products" })),
      client.send(new ScanCommand({ TableName: "stocks" })),
    ]);

    const stocks = (stocksResult.Items ?? []).map((i) => unmarshall(i));

    const products = (productsResult.Items ?? []).map((item) => {
      const product = unmarshall(item);
      const stock = stocks.find((s) => s.product_id === product.id);
      return { ...product, count: stock?.count ?? 0 };
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(products),
    };
  } catch (e) {
    console.error("getProductsList error:", e);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
