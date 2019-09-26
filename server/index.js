const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require('axios')
const client_KEY = require('../spotify.config.js');

// Controllers
// const getAlbums = require('./controllers/getAlbums')

app.use(bodyParser.json());
//app.use(express.static(__dirname + ' FILL_ME_IN'));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => (console.log(`listening on port ${PORT}!`)));
}

const config = {
  headers: { 'Authorization': 'Bearer ' + client_KEY }
}

app.get('/artists/:id', (req, res) => {
  const { id } = req.params
  let albums = {}
  axios.get(`https://api.spotify.com/v1/artists/${id}/albums`, config)
    .then(({ data }) => {
      albums.artist = data.items[0].artists[0].name
      albums.albums = []
      for (let item of data.items) {
        let albumUri = item.uri.split(':')
        albumUri = albumUri[2]
        albums.albums.push({
          albumName: item.name,
          uri: `/artist/album/${albumUri}`
        })
      }
      // console.log(albums)
      res.status(200).send(albums)
    })
    .catch(err => {
      console.log(err)
      res.status(404).send('Artist cannot be found')
    })
})

app.get('/artist/album/:uri', (req, res) => {
  let { uri } = req.params
  //console.log(uri)
  let tracks = {}
  axios.get(`https://api.spotify.com/v1/albums/${uri}/tracks`, config)
    .then(({ data }) => {
      tracks.artist = data.items[0].artists[0].name
      tracks.songsURI = ''
      tracks.songs = []
      for (let item of data.items) {
        let trackUri = item.uri.split(':')
        trackUri = trackUri[2]
        tracks.songsURI += `${trackUri},`
        tracks.songs.push({
          id: item.id,
          songTitle: item.name
        })
      }
    })
    .then(() => {
      let { songsURI } = tracks
      axios.get(`https://api.spotify.com/v1/audio-features/?ids=${songsURI}`, config)
        .then(({ data }) => {
          let featuresLeng = data.audio_features.length
          for (let i = 0; i < featuresLeng; i++) {
            tracks.songs[i].danceability = data.audio_features[i].danceability
          }
          tracks.songs.sort((a, b) => {
            return b.danceability - a.danceability
          })
          delete tracks.songsURI
          res.status(200).send(tracks)
        })
        .catch(err => {
          res.status(500).send('ERR')
        })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send('ERROR')
    })
})

module.exports = app;