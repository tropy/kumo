import { Release } from './release'

export async function handler(event) {
  let { channel } = event?.pathParameters || {}
  let { offset = 0, order, limit } = event?.queryStringParameters || {}

  let releases = await Release.all({ channel })

  if (order === 'asc')
    releases = releases.reverse()

  return releases
    .slice(offset, limit)
    .map(r => r.toJSON())
}
