import { Release } from './release'

export async function handler(event, context) {
  let releases = await Release.all()

  return releases.map(r => r.toJSON())
}
