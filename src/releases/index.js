import { Release } from './release'

export async function handler(event) {
  let { channel } = event?.pathParameters || {}
  let { offset = 0, limit } = event?.queryStringParameters || {}

  let releases = await Release.all({ channel })

  return releases
    .slice(offset, limit)
    .map(r => r.toJSON())
}
