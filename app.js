import express from 'express'
import logger from 'morgan'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import marked from 'marked'

var debug = require('debug')('Tally:app');
var router = express.Router()

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))

//
// Routes
// -----------------------------------------------------------------------------

router.get('/api', (req, res) => {
  res.status(200).json({
    apiVersion: "1.0"
  })
})

router.get('/api/imagesearch/:search', (req, res, next) => {
  if (!('search' in req.params)) {
    res.status(200).send('NOT OK');
  }

  if (req.params.search === '') {
    res.status(200).send('NOT OK');
  }

  let searchQuery = req.params.search;

  debug('search query = ' + searchQuery);

  if ('offset' in req.query) {
    let offset = req.query.offset;
    debug('offset = ' + offset);
  }

  res.status(200).send('OK');
});

router.get("/", (req, res, next) => {
  // Render the README file.
  var p = new Promise(function(res, rej){
    fs.readFile("README.md", "utf8", function(err, data) {
      if (err) throw err
      res(data)
    })
  }).then(function(val){
    res.status(200).send(marked(val.toString()))
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
