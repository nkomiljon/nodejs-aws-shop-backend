import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { handler } from "../lambda/getProductsById";

jest.mock("@aws-sdk/client-dynamodb", () => {
  const send = jest.fn();
  return {
    DynamoDBClient: jest.fn(() => ({ send })),
    GetItemCommand: jest.fn(),
  };
});

const mockSend = new DynamoDBClient({}).send as jest.Mock;

const mockEvent = (productId: string) => ({
  pathParameters: { productId },
}) as any;

describe("getProductsById", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with product and stock joined", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: { S: "1" }, title: { S: "BYD ATTO" }, description: { S: "EV" }, price: { N: "24" } } })
      .mockResolvedValueOnce({ Item: { product_id: { S: "1" }, count: { N: "10" } } });

    const result = await handler(mockEvent("1"), {} as any, {} as any) as any;

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({ id: "1", title: "BYD ATTO", count: 10 });
  });

  it("returns count 0 when stock is not found", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { id: { S: "1" }, title: { S: "BYD ATTO" }, description: { S: "EV" }, price: { N: "24" } } })
      .mockResolvedValueOnce({ Item: undefined });

    const result = await handler(mockEvent("1"), {} as any, {} as any) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).count).toBe(0);
  });

  it("returns 404 when product is not found", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: undefined })
      .mockResolvedValueOnce({ Item: undefined });

    const result = await handler(mockEvent("999"), {} as any, {} as any) as any;

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe("Product not found");
  });

  it("returns 500 on DynamoDB error", async () => {
    mockSend.mockRejectedValueOnce(new Error("DB error"));

    const result = await handler(mockEvent("1"), {} as any, {} as any) as any;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe("Internal server error");
  });
});
