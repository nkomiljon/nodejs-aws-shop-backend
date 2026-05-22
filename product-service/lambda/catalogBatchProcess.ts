import { SQSHandler } from "aws-lambda";
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});

export const handler: SQSHandler = async (event) => {
  console.log("catalogBatchProcess invoked, records:", JSON.stringify(event.Records));

  for (const record of event.Records) {
    try {
      const { title, description, price, count } = JSON.parse(record.body);

      if (!title || price == null || count == null) {
        console.error("Invalid product data in message:", record.body);
        continue;
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

      console.log("Product created:", { id, title, description, price, count });
    } catch (e) {
      console.error("Error processing record:", record.body, e);
    }
  }
};
