import { Release } from './release'
import { json } from '../http.js'

export async function handler(event) {
  let {
    arch,
    channel,
    limit,
    offset = 0,
    order,
    platform,
    version
  } = {
    ...event?.queryStringParameters,
    ...event?.pathParameters
  }

  if (channel === 'stable')
    channel = 'latest'

  let releases = await Release.select({
    arch,
    channel,
    platform,
    range: version,
    order,
    limit,
    offset
  })

  return json(releases.map(r => r.toJSON()))
}
