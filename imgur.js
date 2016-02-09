/**
 * Created by Justin on 2016-02-08.
 */

import fetch from 'node-fetch'
import oauth from 'oauth'
import qs from 'querystring'

var OAuth2 = oauth.OAuth2

var oauth2 = new OAuth2(process.env.IMGUR_API_CLIENT_ID, process.env.IMGUR_API_CLIENT_SECRET,
  'https://api.imgur.com', '/oauth2/authorize', '/oauth2/token', null)

let _accessToken = ''

oauth2.getOAuthAccessToken('', {'grant_type': 'client_credentials'},
    (e, accessToken, refreshToken, results) => {
        console.log('bearer: ', accessToken);
      _accessToken = accessToken
      return accessToken;
    })

console.log('hello')

function fetchImgur(searchQuery, offset = 0) {
  // http://api.imgur.com/endpoints/gallery
  let url = `https://api.imgur.com/3/gallery/search/time/${offset}?q=` + searchQuery

  var result = fetch(url, {
      headers: {
          Authorization: 'Client-ID ' + process.env.IMGUR_API_CLIENT_ID
      }
  }).then(response => {
      return response.json()
  }).then(json => {
      console.log('json', json);
  })
}

export default {
  fetchImgur: fetchImgur
}
