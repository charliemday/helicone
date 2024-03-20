import { AwsClient } from "aws4fetch";
import { Result } from "../result";

export class S3Client {
  private static region = "us-west-2";
  private static bucketName = "request-response-storage";
  awsClient: AwsClient;

  constructor(
    private accessKey: string,
    private secretKey: string,
    private bucketName: string
  ) {
    this.awsClient = new AwsClient({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      service: "s3",
      region: S3Client.region,
    });
  }

  static getRequestResponseUrl = (requestId: string, orgId: string) => {
    const key = `organizations/${orgId}/requests/${requestId}`;
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  };

  async getRequestResponseBody(
    orgId: string,
    requestId: string,
    request: string,
    response: string
  ): Promise<Result<string, string>> {
    const url = S3Client.getRequestResponseUrl(requestId, orgId);

    return this.store(url, JSON.stringify({ request, response }));
  }

  async store(url: string, value: string): Promise<Result<string, string>> {
    const signedRequest = await this.awsClient.sign(url, {
      method: "GET",
    });

    const response = await fetch(signedRequest.url, signedRequest);

    if (!response.ok) {
      return {
        data: null,
        error: `Failed to store data: ${response.statusText}`,
      };
    }

    const data = await response.text();
    return { data: data, error: null };
  }
}
