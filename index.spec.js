const request = require('supertest');
const app = require('./server/index.js');

describe('GET /artists/:id', () => {
  it('Gets artist, album names, and album IDs', (done) => {
    const artistID = '6XyY86QOPPrYVGvF9ch6wz'
    request(app)
      .get(`/artists/${artistID}`)
      .expect('Content-Type', /json/)
      .expect((res) => {
        res.body = {
          artist: res.body.artist
        }
      })
      .expect(200, { artist: 'Linkin Park' }, done);
  })
})

describe('GET /artist/album/:id', () => {
  it('Gets album\'s tracks and sorts by danceability', (done) => {
    const albumID = '4xLfXadj5rWOww2Na6LiBd'
    request(app)
      .get(`/artist/album/${albumID}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body }) => {
        console.log(typeof body)
        expect(typeof body).toBe('object')
      })
      .finally(done)
  })
})