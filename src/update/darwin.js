import { Release } from '../releases/release'
import { noContent } from '../http'

export async function handleUpdateRequest({ arch, channel, version }) {

  // TODO handle old macOS

  let [release] = await Release.select({
    arch,
    channel,
    platform: 'darwin',
    range: `>${version}`,
    limit: 1
  })

  return release?.getUpdateInfo('darwin', arch) || noContent()
}
