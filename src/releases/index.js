import { Release } from './release'

export async function handler(event, context) {
  let releases = await Release.all()
  let { offset = 0, limit } = event?.queryStringParameters || {}

  return releases
    .slice(offset, limit)
    .map(r => r.toJSON())
}
