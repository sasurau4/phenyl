// @flow

import type {
  AnyResponseData,
  EncodedHttpResponse,
} from 'phenyl-interfaces'

/**
 * Decode HTTP Response into AnyResponseData.
 * Only "body" field is used for decoding.
 */
export default function decodeResponse(encodedResponse: EncodedHttpResponse): AnyResponseData {
  const { body } = encodedResponse
  if (typeof body === 'string') {
    return JSON.parse(body)
  }
  return body
}
