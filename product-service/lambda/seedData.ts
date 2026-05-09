import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async () => {
  await client.send(
    new BatchWriteItemCommand({
      RequestItems: {
        products: [
          { PutRequest: { Item: { id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000001" }, title: { S: "BYD ATTO 3 EVO" }, description: { S: "Electric SUV with 510 km Range" }, price: { N: "24" } } } },
          { PutRequest: { Item: { id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000002" }, title: { S: "BYD SEALION 5 DM-i" }, description: { S: "The super Hybrid SUV" }, price: { N: "15" } } } },
          { PutRequest: { Item: { id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000003" }, title: { S: "BYD TANG" }, description: { S: "The 7-seater All-Electric Performance" }, price: { N: "23" } } } },
          { PutRequest: { Item: { id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000004" }, title: { S: "BYD ATTO 2 DM-i" }, description: { S: "Compact Hybrid SUV" }, price: { N: "15" } } } },
          { PutRequest: { Item: { id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000005" }, title: { S: "BYD SEAL 6 DM-i" }, description: { S: "Plug-in Hybrid Car" }, price: { N: "65" } } } },
        ],
        stocks: [
          { PutRequest: { Item: { product_id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000001" }, count: { N: "10" } } } },
          { PutRequest: { Item: { product_id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000002" }, count: { N: "5" } } } },
          { PutRequest: { Item: { product_id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000003" }, count: { N: "8" } } } },
          { PutRequest: { Item: { product_id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000004" }, count: { N: "3" } } } },
          { PutRequest: { Item: { product_id: { S: "a3f1c2d4-1111-4b5e-8a9f-000000000005" }, count: { N: "12" } } } },
        ],
      },
    })
  );
};
