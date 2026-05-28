import { S3Event } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Readable } from "stream";
import csv from "csv-parser";

const s3 = new S3Client();
const sqs = new SQSClient();
const QUEUE_URL = process.env.CATALOG_ITEMS_QUEUE_URL!;

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Parsing file: s3://${bucket}/${key}`);

    const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    await new Promise<void>((resolve, reject) => {
      (Body as Readable)
        .pipe(csv())
        .on("data", async (row) => {
          await sqs.send(
            new SendMessageCommand({
              QueueUrl: QUEUE_URL,
              MessageBody: JSON.stringify(row),
            })
          );
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }
};
