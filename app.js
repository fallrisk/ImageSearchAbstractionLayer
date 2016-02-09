import express from 'express'
import logger from 'morgan'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import marked from 'marked'
import fetch from 'whatwg-fetch'

var debug = require('debug')('Tally:app');
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

router.get('/api/imagesearch/:search', (req, res, next) => {

  var promise = new Promise((resolve, reject) => {
    if (!('search' in req.params)) {
      res.status(200).send('NOT OK');
    }

    if (req.params.search === '') {
      res.status(200).send('NOT OK');
    }

    let searchQuery = req.params.search;

    debug('search query = ' + searchQuery);

    if ('query' in req) {
      if (typeof req.query.offset !== 'undefined') {
        let offset = req.query.offset;
        debug('offset = ' + offset);
      }
    }

    // Store the search.
    _searches.push({term: searchQuery, when: Date.now()});

    res.status(200).send('OK');
  });
  return promise;
});

router.get('/api/latest/imagesearch', (req, res) => {
  res.status(200).json({
    apiVersion: "1.0",
    data: {
      _searches
    }
  })
})

router.get("/", (req, res, next) => {
  // Render the README file.
  var p = new Promise(function(res, rej){
    fs.readFile("README.md", "utf8", function(err, data) {
      if (err) throw err
      res(data)
    })
  }).then(function(val) {
    let readme = marked(val.toString());
    let html = `<html><head><link rel="stylesheet" href="index.css"/></head><body>${readme}</body></html>`;
    res.status(200).send(html);
  })
  return p
})

app.use(router)

//
// Error Handlers
// -----------------------------------------------------------------------------

// Development Error Handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// Production Error Handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})

module.exports = app;
