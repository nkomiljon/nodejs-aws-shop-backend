import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { handler } from "../lambda/createProduct";

jest.mock("@aws-sdk/client-dynamodb", () => {
  const send = jest.fn();
  return {
    DynamoDBClient: jest.fn(() => ({ send })),
    TransactWriteItemsCommand: jest.fn(),
  };
});

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "mock-uuid"),
}));

const mockSend = new DynamoDBClient({}).send as jest.Mock;

const mockEvent = (body: object | null) => ({
  body: body ? JSON.stringify(body) : null,
}) as any;

describe("createProduct", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with created product", async () => {
    mockSend.mockResolvedValueOnce({});

    const result = await handler(
      mockEvent({ title: "BYD ATTO", description: "EV", price: 24, count: 10 }),
      {} as any,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({ id: "mock-uuid", title: "BYD ATTO", price: 24, count: 10 });
  });

  it("returns 400 when title is missing", async () => {
    const result = await handler(
      mockEvent({ description: "EV", price: 24, count: 10 }),
      {} as any,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("title, price and count are required");
  });

  it("returns 400 when price is missing", async () => {
    const result = await handler(
      mockEvent({ title: "BYD ATTO", count: 10 }),
      {} as any,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("title, price and count are required");
  });

  it("returns 400 when count is missing", async () => {
    const result = await handler(
      mockEvent({ title: "BYD ATTO", price: 24 }),
      {} as any,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe("title, price and count are required");
  });

  it("returns 500 on DynamoDB error", async () => {
    mockSend.mockRejectedValueOnce(new Error("DB error"));

    const result = await handler(
      mockEvent({ title: "BYD ATTO", price: 24, count: 10 }),
      {} as any,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe("Internal server error");
  });
});
