import 'babel-polyfill'
import express from 'express'
import logger from 'morgan'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import marked from 'marked'
import fetch from 'whatwg-fetch'
import emojione from 'emojione'

import imgur from './imgur'

var debug = require('debug')('app:root');
var router = express.Router()

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))

// {term: '', when: Date.now()}
var _searches = []

//
// Routes
// -----------------------------------------------------------------------------

router.get('/api', (req, res) => {
  res.status(200).json({
    apiVersion: "1.0"
  })
})

router.get('/api/imagesearch/:search', async (req, res) => {

  if (!('search' in req.params)) {
    res.status(200).send('NOT OK')
  }

  if (req.params.search === '') {
    res.status(200).send('NOT OK')
  }

  let searchQuery = req.params.search

  debug('search query = ' + searchQuery)

  let offset = 0

  if ('query' in req) {
    if ('offset' in req.query) {
      offset = req.query.offset
    }
  }

  debug('offset  = ' + offset)

  // Store the search query.
  _searches.push({ term: searchQuery, when: Date.now() })

  let results = await imgur.fetchImgur(searchQuery, offset)

  res.status(200).json({
    apiVersion: "1.0",
    data: {
      count: results.length,
      results: results
    }
  })
})

router.get('/api/latest/imagesearch', (req, res) => {
  res.status(200).json({
    apiVersion: "1.0",
    data: {
      recentSearches: _searches
    }
  })
})

router.get("/", (req, res) => {
  // Render the README file.
  return new Promise(function (res, rej) {
    fs.readFile("README.md", "utf8", function (err, data) {
      if (err) rej(err)
      res(data)
    })
  }).then(function (val) {
    let readme = marked(val.toString());
    // Add emojis.
    readme = emojione.shortnameToImage(readme)
    let html = `<html><head><link rel="stylesheet" href="public/index.css"/></head><body>${readme}</body></html>`;
    res.status(200).send(html);
  })
})

app.use(router)

//
// Error Handlers
// -----------------------------------------------------------------------------

// Development Error Handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// Production Error Handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app;
