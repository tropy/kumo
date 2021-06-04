import * as darwin from './darwin'
import * as win32 from './win32'
import { badRequest } from '../http'

// /update/{channel}/{platform}/{version}
// /update/{channel}/{platform}/{arch}/{version}

export async function handler(event) {
  let {
    channel,
    platform,
    arch = 'x64',
    version
  } = {
    ...event?.pathParameters
  }

  if (channel === 'stable')
    channel = 'latest'

  switch (platform) {
    case 'darwin':
      return darwin.handleUpdateRequest({ channel, arch, version }, event)
    case 'win32':
      return win32.handleUpdateRequest({ channel, arch, file: version })
    default:
      return badRequest('invalid platform')
  }
}
