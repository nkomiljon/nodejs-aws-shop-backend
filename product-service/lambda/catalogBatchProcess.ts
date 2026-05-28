import { SQSHandler } from "aws-lambda";
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from "crypto";

const dynamodb = new DynamoDBClient({});
const sns = new SNSClient({});
const TOPIC_ARN = process.env.CREATE_PRODUCT_TOPIC_ARN!;

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

      await dynamodb.send(
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

      const product = { id, title, description, price, count };
      console.log("Product created:", product);

      await sns.send(
        new PublishCommand({
          TopicArn: TOPIC_ARN,
          Subject: "New Product Created",
          Message: JSON.stringify(product),
        })
      );
    } catch (e) {
      console.error("Error processing record:", record.body, e);
    }
  }
};
