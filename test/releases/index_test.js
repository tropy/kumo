import { handler } from '../../src/releases'

describe('Releases', () => {
  it('returns a list of releases', async () => {
    let res = await handler()

    expect(res).to.be.an('array')
    expect(res.length).to.be.above(1)
    expect(res[0]).to.have.a.property('version')
  })

  it('accepts latest-release event', async () => {
    let res = await handler(E('latest-release'))
    expect(res).to.be.an('array').and.have.lengthOf(1)
  })
})
