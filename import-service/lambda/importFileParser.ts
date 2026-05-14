import { S3Event } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3 = new S3Client();

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Parsing file: s3://${bucket}/${key}`);

    const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    await new Promise<void>((resolve, reject) => {
      (Body as Readable)
        .on("data", (chunk: Buffer) => console.log(chunk.toString()))
        .on("end", resolve)
        .on("error", reject);
    });
  }
};
