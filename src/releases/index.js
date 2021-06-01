import { Release } from './release'

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

  return releases.map(r => r.toJSON())
}
