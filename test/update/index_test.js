import { parse } from 'semver'
import { handler } from '../../src/update'
import { Release } from '../../src/releases/release'

describe('UpdateFunction', () => {
  let LATEST
  let BETA

  describe('darwin', async () => {
    beforeEach(async () => {
      LATEST = parse((await Release.latest({ platform: 'darwin' })).version.raw)
      BETA = parse((await Release.latest({ platform: 'darwin', channel: 'beta' })).version.raw)
    })

    it('responds with latest version if there is an update', async () => {
      for (let res of [
        handler(R('latest/darwin/1.8.2')),
        handler(R('stable/darwin/1.8.2')),
        handler(R('latest/darwin/x64/1.8.0')),
        handler(R('stable/darwin/x64/1.5.2'))
      ]) {
        let { name, url, notes } = await res
        expect(name).to.eql(LATEST.version)
        expect(notes)
          .to.eql(`https://github.com/tropy/tropy/releases/tag/${LATEST}`)
        expect(url)
          .to.eql(`https://github.com/tropy/tropy/releases/download/${LATEST}/tropy-${LATEST}.zip`)
      }

      expect(await handler(R('latest/darwin/arm64/1.8.9'))).to.have.property('url',
        `https://github.com/tropy/tropy/releases/download/${LATEST}/tropy-${LATEST}-arm64.zip`)
    })

    it('responds with latest version if there is an update in the beta channel', async () => {
      expect(await handler(R('beta/darwin/1.8.2-beta.3')))
        .to.have.property('name', BETA.version)
    })

    it('responds with 204 if there is no update', async () => {
      for (let res of [
        handler(R(`latest/darwin/${LATEST}`)),
        handler(R(`stable/darwin/${LATEST}`)),
        handler(R(`beta/darwin/${BETA}`)),
        handler(R(`latest/darwin/x64/${LATEST}`)),
        handler(R(`stable/darwin/x64/${LATEST}`)),
        handler(R(`beta/darwin/x64/${BETA}`)),
        handler(R('none/darwin/x64/1.0.0')),
        handler(R(`latest/darwin/ia32/${LATEST}`)),
        handler(R(`latest/darwin/arm64/${LATEST}`)),
        handler(R(`latest/darwin/x64/${LATEST.inc('patch')}`)),
        handler(R(`latest/darwin/x64/${LATEST.inc('minor')}`)),
        handler(R(`latest/darwin/x64/${LATEST.inc('major')}`)),
        handler(R(`beta/darwin/x64/${BETA.inc('pre')}`))
      ]) {
        expect(await res).to.have.property('statusCode', 204)
      }
    })

    it('responds with 400 bad request for invalid versions', async () => {
      for (let res of [
        handler(R('latest/darwin/x64')),
        handler(R('beta/darwin/x64')),
        handler(R('latest/darwin/x64/no-version')),
        handler(R('latest/darwin/arm64/no-version')),
        handler(R('beta/darwin/arm64/no-version'))
      ]) {
        expect(await res).to.have.property('statusCode', 400)
      }
    })
  })

  describe('win32', () => {
  })

  describe('other platforms', () => {
    it('responds with 400 bad request', async () => {
      for (let res of [
        handler(),
        handler(R('')),
        handler(R('latest')),
        handler(R('latest/linux')),
        handler(R('latest/linux/x64')),
        handler(R('latest/linux/x64/1.9.2')),
        handler(R('latest/mac/x64/1.9.2')),
      ]) {
        expect(await res).to.have.property('statusCode', 400)
      }
    })
  })
})

let R = (url) => {
  let parts = url.split('/')
  return {
    rawPath: url,
    pathParameters: {
      channel: parts[0],
      platform: parts[1],
      arch: parts[2],
      version: parts[3]
    }
  }
}

