import { parse } from 'semver'
import { Release } from '../releases/release'
import { noContent, notFound, redirect, send } from '../http'

export async function handleUpdateRequest({ arch, channel, file }) {
  let releases = await Release.select({
    arch,
    channel,
    platform: 'win32',
    order: 'asc'
  })

  if (file === 'RELEASES') {
    if (releases.length)
      return send(RELEASES(releases, arch))
    else
      return noContent()
  }

  let version = nuPkgVersion(file)
  let release = releases.find(r => r.version.eq(version))

  if (release != null)
    return redirect(release.getUpdateInfo('win32', arch))
  else
    return notFound()
}

export const nuPkgVersion = (file, channel, arch) => parse(
  file
    .replace(/^\D+/, '')
    .replace(/-(delta|full)\.nupkg$/, '')
    .replace(channel, `${channel}.`)
    .replace(`-${arch}`, '')
)

const RELEASES = (releases, arch) =>
  releases
    .map(r => r.build.win32.arch[arch])
    .concat('')
    .join('\r\n')

