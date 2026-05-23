import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { handler } from "../lambda/getProductsList";

jest.mock("@aws-sdk/client-dynamodb", () => {
  const send = jest.fn();
  return {
    DynamoDBClient: jest.fn(() => ({ send })),
    ScanCommand: jest.fn(),
  };
});

const mockSend = new DynamoDBClient({}).send as jest.Mock;

const mockProducts = [
  { id: { S: "1" }, title: { S: "BYD ATTO" }, description: { S: "EV" }, price: { N: "24" } },
];
const mockStocks = [{ product_id: { S: "1" }, count: { N: "10" } }];

describe("getProductsList", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with joined products and stocks", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: mockProducts })
      .mockResolvedValueOnce({ Items: mockStocks });

    const result = await handler({} as any, {} as any, {} as any) as any;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: "1", title: "BYD ATTO", count: 10 });
  });

  it("returns count 0 when stock is not found", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: mockProducts })
      .mockResolvedValueOnce({ Items: [] });

    const result = await handler({} as any, {} as any, {} as any) as any;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body[0].count).toBe(0);
  });

  it("returns 500 on DynamoDB error", async () => {
    mockSend.mockRejectedValueOnce(new Error("DB error"));

    const result = await handler({} as any, {} as any, {} as any) as any;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe("Internal server error");
  });
});
