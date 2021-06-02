
export const send = (body) => ({
  statusCode: 200,
  headers: {
    'content-type': 'application/octet-stream; charset=utf-8',
    'content-length': Buffer.byteLength(body, 'utf8')
  },
  body
})

export const noContent = () => ({
  statusCode: 204
})

export const redirect = (location, statusCode = 302) => ({
  statusCode,
  headers: {
    location
  }
})

export const badRequest = (body = 'bad request') => ({
  statusCode: 400,
  body
})

export const notFound = (body = 'not found') => ({
  statusCode: 404,
  body
})
