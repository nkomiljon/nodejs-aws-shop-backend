import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";
import { handler } from "../lambda/catalogBatchProcess";

jest.mock("@aws-sdk/client-dynamodb", () => {
  const send = jest.fn();
  return {
    DynamoDBClient: jest.fn(() => ({ send })),
    TransactWriteItemsCommand: jest.fn(),
  };
});

jest.mock("@aws-sdk/client-sns", () => {
  const send = jest.fn();
  return {
    SNSClient: jest.fn(() => ({ send })),
    PublishCommand: jest.fn(),
  };
});

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "mock-uuid"),
}));

const mockDynamoSend = new DynamoDBClient({}).send as jest.Mock;
const mockSnsSend = new SNSClient({}).send as jest.Mock;

process.env.CREATE_PRODUCT_TOPIC_ARN = "arn:aws:sns:eu-west-1:123456789:createProductTopic";

const mockSqsEvent = (records: object[]) => ({
  Records: records.map((body) => ({ body: JSON.stringify(body) })),
}) as any;

describe("catalogBatchProcess", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a product and publishes SNS for each valid record", async () => {
    mockDynamoSend.mockResolvedValue({});
    mockSnsSend.mockResolvedValue({});

    await handler(
      mockSqsEvent([{ title: "BYD ATTO", description: "EV", price: 24, count: 10 }]),
      {} as any,
      {} as any
    );

    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
    expect(mockSnsSend).toHaveBeenCalledTimes(1);
  });

  it("processes multiple records in a batch", async () => {
    mockDynamoSend.mockResolvedValue({});
    mockSnsSend.mockResolvedValue({});

    await handler(
      mockSqsEvent([
        { title: "BYD ATTO", description: "EV", price: 24, count: 10 },
        { title: "BYD TANG", description: "SUV", price: 45, count: 5 },
      ]),
      {} as any,
      {} as any
    );

    expect(mockDynamoSend).toHaveBeenCalledTimes(2);
    expect(mockSnsSend).toHaveBeenCalledTimes(2);
  });

  it("skips invalid records missing required fields", async () => {
    await handler(
      mockSqsEvent([{ description: "No title or price" }]),
      {} as any,
      {} as any
    );

    expect(mockDynamoSend).not.toHaveBeenCalled();
    expect(mockSnsSend).not.toHaveBeenCalled();
  });

  it("continues processing remaining records when one fails", async () => {
    mockDynamoSend
      .mockRejectedValueOnce(new Error("DB error"))
      .mockResolvedValueOnce({});
    mockSnsSend.mockResolvedValue({});

    await handler(
      mockSqsEvent([
        { title: "BYD ATTO", price: 24, count: 10 },
        { title: "BYD TANG", price: 45, count: 5 },
      ]),
      {} as any,
      {} as any
    );

    expect(mockDynamoSend).toHaveBeenCalledTimes(2);
    expect(mockSnsSend).toHaveBeenCalledTimes(1);
  });
});
