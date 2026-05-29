import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from "aws-lambda";

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log("basicAuthorizer invoked, authorizationToken:", event.authorizationToken);

  const token = event.authorizationToken;

  if (!token || !token.startsWith("Basic ")) {
    console.error("Authorization header not provided");
    throw new Error("Unauthorized");
  }

  try {
    const base64Credentials = token.split(" ")[1];
    const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [username, password] = decoded.split(":");

    console.log("Authenticating user:", username);

    const storedPassword = process.env[username];
    const isValid = storedPassword && storedPassword === password;

    if (!isValid) {
      console.error("Invalid credentials for user:", username);
      return generatePolicy(username, "Deny", event.methodArn);
    }

    return generatePolicy(username, "Allow", event.methodArn);
  } catch (e) {
    console.error("basicAuthorizer error:", e);
    throw new Error("Unauthorized");
  }
};

const generatePolicy = (
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
