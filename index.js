const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

var HEIGHT;
var WIDTH;
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game
  var gameObject = request.body;
  HEIGHT = gameObject.board.height;
  WIDTH = gameObject.board.width;
  // Response data
  const data = {
    color: '#ff5354',
    headType: 'silly',
    tailType: 'curled'
  }

  return response.json(data)
})

function getSnakes(gameObject)
{
    return gameObject.board.snakes;
}

function getFood(gameObject)
{
    return gameObject.board.food;
}

function getCurrentLocation(gameObject)
{
    return gameObject.you.body;
}
// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  console.log(request); // Check heroku logs
  console.log(getCurrentLocation(request.body));
  // Response data
  const data = {
    move: 'down', // one of: ['up','down','left','right']
  }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
