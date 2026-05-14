import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("createProduct invoked, body:", event.body);

  try {
    const body = JSON.parse(event.body ?? "{}");
    const { title, description, price, count } = body;

    if (!title || price == null || count == null) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ message: "title, price and count are required" }),
      };
    }

    const id = randomUUID();

    await client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: "products",
              Item: {
                id: { S: id },
                title: { S: title },
                description: { S: description ?? "" },
                price: { N: String(price) },
              },
            },
          },
          {
            Put: {
              TableName: "stocks",
              Item: {
                product_id: { S: id },
                count: { N: String(count) },
              },
            },
          },
        ],
      })
    );

    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify({ id, title, description, price, count }),
    };
  } catch (e) {
    console.error("createProduct error:", e);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
