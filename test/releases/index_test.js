import { handler } from '../../src/releases'

describe('Releases', () => {
  it('returns a list of releases', async () => {
    let res = await handler()

    expect(res).to.be.an('array')
    expect(res[0]).to.have.a.property('version')
  })
})
