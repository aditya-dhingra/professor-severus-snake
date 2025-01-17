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

function generateIllegalBlocks(gameObject) {
  var illegalBlocks = {};
  var x, y,
    snakes = getSnakes(gameObject),
    ourSnake = getCurrentLocation(gameObject),
    ourLength = ourSnake.length;
  // Borders and Corners
  for(x = 0, y = 0; x <= WIDTH+1; x++) {
    illegalBlocks[[x,y]] = -1;
  }
  for(x = 0, y = 0; y <= HEIGHT+1; y++) {
    illegalBlocks[[x,y]] = -1;
  }
  for(x = 0, y = HEIGHT+1; x <= WIDTH+1; x++) {
    illegalBlocks[[x,y]] = -1;
  }
  for(x = WIDTH+1, y = 0; y <= HEIGHT+1; y++) {
    illegalBlocks[[x,y]] = -1;
  }
  // Our Snake
  for(var i = 0; i < ourLength; i++) {
    var head = ourSnake[i];
    head.x += 1;
    head.y += 1;
    illegalBlocks[[head.x, head.y]] = -1;
  }
  // Other Snakes
  snakes.forEach(function (snake) {
    if (snake.name !== 'sagargandhi33 / professor-severus-snake') {
      var snakeLength = snake.body.length;
      if(ourLength <= snakeLength) {
        var head = snake.body[0];
        head.x += 1;
        head.y += 1;
        illegalBlocks[[head.x + 1, head.y]] = -1;
        illegalBlocks[[head.x - 1, head.y]] = -1;
        illegalBlocks[[head.x, head.y + 1]] = -1;
        illegalBlocks[[head.x, head.y - 1]] = -1;
      }
      for(var i = 1; i < snakeLength; i++) {
        var head = snake.body[i];
        head.x += 1;
        head.y += 1;
        illegalBlocks[[head.x, head.y]] = -1;
      }
    }
  });

  return illegalBlocks;
}

function nextMove(gameObject) {
  var loc = getCurrentLocation(gameObject);
  var illegalBlocks = generateIllegalBlocks(gameObject);

  var head = loc[0];
  head.x += 1;
  head.y += 1;
  if(illegalBlocks[[head.x+1,head.y]]){
    return "right";
  }
  if (illegalBlocks[[head.x,head.y+1]]){
    return "up";
  }
  // if (illegalBlocks[[head.x-1,head.y]]){
  //   return "left";
  // }
  // if (illegalBlocks[[head.x,head.y-1]]){
  //   return "down";
  // }
}

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  console.log(request); // Check heroku logs
  var gameObject = request.body;
  var illegalBlocks = generateIllegalBlocks(gameObject);
  console.log(illegalBlocks);
  // Response data
  const data = {
    move: nextMove(gameObject) || "up", // one of: ['up','down','left','right']
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
