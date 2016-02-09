/**
 * Created by Justin on 2016-02-08.
 */

import 'babel-polyfill'
import fetch from 'node-fetch'
import oauth from 'oauth'
import qs from 'querystring'

async function fetchImgur (searchQuery, offset = 0) {
  // http://api.imgur.com/endpoints/gallery
  let url = `https://api.imgur.com/3/gallery/search/time/${offset}?q=${searchQuery}`

  var results = await fetch(url, {
    headers: {
      Authorization: 'Client-ID ' + process.env.IMGUR_API_CLIENT_ID
    }
  }).then(response => {
    return response.json()
  }).then(json => {
    return json
  })

  return results.data.map(result => {
    return { title: result.title, url: result.link }
  })
}

export default {
  fetchImgur: fetchImgur
}
