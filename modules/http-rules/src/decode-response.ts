import { EncodedHttpResponse, GeneralResponseData } from "@phenyl/interfaces";

/**
 * Decode HTTP Response into ResponseData.
 * Only "body" field is used for decoding.
 */
export default function decodeResponse(
  encodedResponse: EncodedHttpResponse
): GeneralResponseData {
  const { body } = encodedResponse;

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
}
