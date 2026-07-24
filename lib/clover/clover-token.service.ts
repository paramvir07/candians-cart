import { dbConnect } from "@/db/dbConnect";
import { CloverConnection } from "@/db/models/clover/cloverConnection.model";
import { getCloverConfig } from "./clover.config";
import { decryptCloverSecret, encryptCloverSecret } from "./token-crypto";

interface CloverTokenResponse {
  access_token: string;
  access_token_expiration: number;
  refresh_token: string;
  refresh_token_expiration: number;
}

const ACCESS_TOKEN_BUFFER_SECONDS = 300;

const getConnectionWithSecrets = async () => {
  const { environment } = getCloverConfig();
  await dbConnect();

  return CloverConnection.findOne({ environment })
    .select("+accessTokenEncrypted +refreshTokenEncrypted")
    .exec();
};

const refreshAccessToken = async (): Promise<string> => {
  const config = getCloverConfig();
  const connection = await getConnectionWithSecrets();

  if (!connection) {
    throw new Error(
      "Clover is not connected. Visit /api/clover/connect while signed in as an admin.",
    );
  }

  if (connection.refreshTokenExpiration <= Math.floor(Date.now() / 1000)) {
    throw new Error(
      "The Clover refresh token has expired. Reconnect Clover from /api/clover/connect.",
    );
  }

  const oldRefreshTokenEncrypted = connection.refreshTokenEncrypted;
  const response = await fetch(`${config.apiBaseUrl}/oauth/v2/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.appId,
      refresh_token: decryptCloverSecret(connection.refreshTokenEncrypted),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    // A simultaneous request may already have used the single-use refresh token.
    // Re-read once before failing.
    const latest = await getConnectionWithSecrets();
    const now = Math.floor(Date.now() / 1000);
    if (
      latest &&
      latest.refreshTokenEncrypted !== oldRefreshTokenEncrypted &&
      latest.accessTokenExpiration > now + ACCESS_TOKEN_BUFFER_SECONDS
    ) {
      return decryptCloverSecret(latest.accessTokenEncrypted);
    }

    const errorBody = await response.text();
    throw new Error(
      `Unable to refresh Clover access token (${response.status}): ${errorBody}`,
    );
  }

  const tokenData = (await response.json()) as CloverTokenResponse;

  if (!tokenData.access_token || !tokenData.refresh_token) {
    throw new Error("Clover refresh response did not include both token values");
  }

  await CloverConnection.updateOne(
    { _id: connection._id },
    {
      $set: {
        accessTokenEncrypted: encryptCloverSecret(tokenData.access_token),
        refreshTokenEncrypted: encryptCloverSecret(tokenData.refresh_token),
        accessTokenExpiration: tokenData.access_token_expiration,
        refreshTokenExpiration: tokenData.refresh_token_expiration,
        lastRefreshedAt: new Date(),
      },
    },
  );

  return tokenData.access_token;
};

export const getValidCloverAccessToken = async (): Promise<string> => {
  const connection = await getConnectionWithSecrets();

  if (!connection) {
    throw new Error(
      "Clover is not connected. Visit /api/clover/connect while signed in as an admin.",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    connection.accessTokenExpiration >
    now + ACCESS_TOKEN_BUFFER_SECONDS
  ) {
    return decryptCloverSecret(connection.accessTokenEncrypted);
  }

  return refreshAccessToken();
};
