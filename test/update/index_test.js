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
          .to.eql(`https://github.com/tropy/tropy/releases/tag/v${LATEST}`)
        expect(url)
          .to.eql(`https://github.com/tropy/tropy/releases/download/v${LATEST}/tropy-${LATEST}-darwin.zip`)
      }

      expect(await handler(R('latest/darwin/arm64/1.8.9'))).to.have.property('url',
        `https://github.com/tropy/tropy/releases/download/v${LATEST}/tropy-${LATEST}-darwin-arm64.zip`)

      expect(await handler(E('update-darwin-x64'))).to.have.property('url')
      expect(await handler(E('update-darwin-arm64'))).to.have.property('url')
    })

    it('responds with latest version if there is an update in the beta channel', async () => {
      let res = await handler(R('beta/darwin/1.8.2-beta.3'))

      expect(res).to.have.property('name', BETA.version)
      expect(res).to.have.property('url',
        `https://github.com/tropy/tropy/releases/download/v${BETA}/tropy-${BETA}-darwin.zip`)
    })

    it('responds with 204 for macOS below High Sierra', async () => {
      let event = E('update-darwin-x64')
      event.headers['User-Agent'] = 'Tropy/Darwin/16.6.0'

      expect(await handler(event)).to.have.property('statusCode', 204)
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
    describe('RELEASES', () => {
      it ('responds with 200 for valid arch', async () => {
        expect(await handler(E('update-win32-x64-releases')))
          .to.have.property('statusCode', 200)
      })

      it('returns x64 RELEASES file if no arch given', async () => {
        let res = await handler(R('latest/win32/RELEASES'))
        let x64 = await handler(R('latest/win32/x64/RELEASES'))

        expect(res.body).to.equal(x64.body)
      })

      for (let channel of ['latest', 'stable', 'beta']) {
        for (let arch of ['x64']) {
          it(`returns ${channel}/${arch}/RELEASES file`, async () => {
            let res = await handler(R(`${channel}/win32/${arch}/RELEASES`))

            expect(res.statusCode).to.eql(200)
            expect(res.headers)
              .to.have.property('content-type', 'application/octet-stream; charset=utf-8')
            expect(res.headers)
              .to.have.property('content-length', res.body.length)
            expect(res.body).to.be.a('string')
          })
        }
      }

      it('returns 204 for unknown archs', async () => {
        for (let res of [
          handler(R('latest/win32/x16/RELEASES'))
        ]) {
          expect(await res).to.have.property('statusCode', 204)
        }
      })
    })

    describe('versioned files', () => {
      it('responds with 302 redirect for matched versions', async () => {
        for (let res of [
          await handler(R('beta/win32/tropy-beta-1.9.0-beta1-full.nupkg')),
          await handler(R('beta/win32/x64/tropy-beta-1.9.0-beta1-full.nupkg')),
          await handler(R('latest/win32/tropy-1.9.0-full.nupkg')),
          await handler(R('latest/win32/x64/tropy-1.9.0-full.nupkg')),
          await handler(R('latest/win32/arm64/tropy-1.10.0-full.nupkg')),
          await handler(R('latest/win32/ia32/tropy-1.10.0-full.nupkg')),
          await handler(R('stable/win32/tropy-1.9.0-full.nupkg')),
          await handler(R('stable/win32/x64/tropy-1.9.0-full.nupkg')),
          await handler(R('stable/win32/tropy-1.8.2-full.nupkg'))
        ]) {
          expect(res).to.have.property('statusCode', 302)
          expect(res.headers).to.have.property('location')
        }

        expect(await handler(R('stable/win32/tropy-1.9.0-full.nupkg')))
          .to.have.nested.property(
            'headers.location',
            'https://github.com/tropy/tropy/releases/download/1.9.0/tropy-1.9.0-full.nupkg')
        expect(await handler(R('beta/win32/tropy-beta-1.9.0-beta1-full.nupkg')))
          .to.have.nested.property(
            'headers.location',
            'https://github.com/tropy/tropy/releases/download/1.9.0-beta.1/tropy-beta-1.9.0-beta1-full.nupkg')

        expect(await handler(E('update-win32-x64-nupkg')))
          .to.have.property('statusCode', 302)
      })

      it('responds with 404 not found for unmatched versions', async () => {
          for (let res of [
            handler(R('beta/win32/x64/1.9.0')),
            handler(R('beta/win32/x64/tropy-1.9.0-full.nupkg')),
            handler(R('latest/win32/x64/1.0.0-alpha.23'))
          ]) {
            expect(await res).to.have.property('statusCode', 404)
          }
      })
    })

    it('returns 400 for files with no version', async () => {
        for (let res of [
          handler(R('latest/win32/x64')),
          handler(R('latest/win32/x64/foobar'))
        ]) {
          expect(await res).to.have.property('statusCode', 400)
        }
    })
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
  let [channel, platform, ...av] = url.split('/')
  return {
    rawPath: url,
    pathParameters: {
      channel,
      platform,
      version: av.pop(),
      arch: av.pop()
    }
  }
}
