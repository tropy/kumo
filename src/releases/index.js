import releases from './releases.json'

export async function handler(event, context) {
  return releases
}
