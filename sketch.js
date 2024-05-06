//Deante Dohman

let port;
let joyX = 0, joyY = 0, sw = 0;
let connectButton;
let danceSpeed
 
//let speed = 3;
 
let partyMusic;
let wrongWay;



const GameState = {
  Start: "Start",
  Playng: "Playing",
  GameOver: "GameOver"
  };
 
let character = [];
let game = { score: 0, maxScore: 0, maxTime: 20, elapsedTime: 0, state: GameState.Start};
let danceMove = ['Left', 'Right', 'Up', 'Down'];
let currentDanceMove = '';
let lastDanceMoveTime = 0;
let danceMoveInterval = 3000;
let intervalReductionRate = 1000; 
 
let score = 0;
let img;
function connect() {
  if (!port.opened()) {
    port.open('Arduino', 9600);
  } else {
    port.close();
  }
}
function reset() {
  game.elapsedTime = 0;
  game.score = 0;
  game.totalSprites = random(5,10);
  animations = [];
  }
 
function preload() {
  let animations = {
    stand: { row: 0, frames: 1},
    walkRight: {row: 0, col: 1, frames: 8},
    walkUp: {row: 5, frames: 6},
    walkDown: {row: 5, col: 6, frames: 6}
  };
 
  character.push(new Character(300, 450, 80, 80, 'Assets/sprite.png', animations));
  img = loadImage('Assets/party.jpg');

  soundFormats("mp3");
  partyMusic = loadSound("Assets/partyM");
  wrongWay = loadSound("Assets/Guitar");

}
 
function setup() {
 
  createCanvas(700, 700);
  background(img);
  fill(0);
  textSize(100);
  text(score,100,100);
  connectButton = createButton("Connect");
  connectButton.mousePressed(connect);
  port = createSerial();
 
  //port = new p5.SerialPort();
  //port.on('data', serialEvent);
  backgroundMusic();
}
 
function backgroundMusic(){
  partyMusic.play();
  partyMusic.loop();
  partyMusic.setVolume(0.3);
  userStartAudio();
}


function draw() {
  switch(game.state) {
    case GameState.Playing:
    background(img);
    fill(0);
    textSize(40);
    fill('white');
    text(game.score,30,40);
  
    fill(255);
    textSize(30);
    textAlign(CENTER);
    text(currentDanceMove, 295, 310);
   
    // Check if it's time to update the dance move
    if (millis() - lastDanceMoveTime >= danceMoveInterval) {
      updateDanceMove();
      lastDanceMoveTime = millis();
    
      // Decrease the interval based on elapsed time
     danceMoveInterval -= intervalReductionRate * (game.elapsedTime / 10);
      // Ensure the interval doesn't go below a minimum value 
      danceMoveInterval = max(danceMoveInterval, 300); // Minimum interval: 0.5 seconds
    }
 
    let currentTime = game.maxTime - game.elapsedTime;
    textSize(50);
    text(ceil(currentTime), 300,40);
    game.elapsedTime += deltaTime / 1000;
  
    if (currentTime < 0)
    game.state = GameState.GameOver;
    break;
    case GameState.GameOver:
    game.maxScore = max(game.score,game.maxScore);
    //text
    background(0);
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text("Game Over!",300,200);
    textSize(35);
    
    text("Max Score: " + game.maxScore,300,320);
    break;
    case GameState.Start:
    background(0);
    fill(255);
    textSize(50);
    textAlign(CENTER);
    text("Bug Game!",300,200);
    textSize(30);
    text("Press Any Key to Start",300,300);
    break;
  }
 

  

  if (joyX !== 0 || joyY !== 0) {
    if (joyX > 0 && currentDanceMove === 'Right') {
      game.score++;
    } else if (joyX < 0 && currentDanceMove === 'Left') {
      game.score++;
    } else if (joyY > 0 && currentDanceMove === 'Down') {
       game.score++;
    } else if (joyY < 0 && currentDanceMove === 'Up') {
      game.score++;
    }else{
      game.score--;
    }
  }
  let str = port.readUntil("\n");
  let values = str.split(",");
  
  if (values.length > 2) {
    joyX = parseInt(values[0]);
    joyY = parseInt(values[1]);
    swPressed = values[2].trim() === "1"; // Convert "1" to true, "0" to false
  }
 
  // Loop through each character in the array
  for (let i = 0; i < character.length; i++) {
   let currentCharacter = character[i];
 
    // Move the character sprite based on joystick input
    if (joyX > 0) {
      currentCharacter.walkRight();
    } else if (joyX < 0) {
      currentCharacter.walkLeft();
    }
 
    if (joyY > 0) {
      currentCharacter.walkDown();
    } else if (joyY < 0) {
      currentCharacter.walkUp();
    }
 
    // Stop character if joystick is centered
    if (joyX === 0 && joyY === 0) {
      currentCharacter.stop();
    }
 
    // Character boundary check
    if (currentCharacter.sprite.position.x + currentCharacter.sprite.width / 4 > width) {
      currentCharacter.walkLeft();
    } else if (currentCharacter.sprite.position.x - currentCharacter.sprite.width / 4 < 0) {
      currentCharacter.walkRight();
    }
 
 
  }
}
 

 

function updateDanceMove() {
  // Get a random index for the danceMove array
  let index = floor(random(danceMove.length));
  // Set the current dance move to the randomly selected move
  currentDanceMove = danceMove[index];
}
 

function keyPressed() {
  switch(game.state) {
  case GameState.Start:
  game.state = GameState.Playing;

  if (swPressed === 1) {
    // Play the sound
    wrongWay.play();
    console.log("Joystick button pressed!");
  }
  break;
  case GameState.GameOver:
  reset();
  game.state = GameState.Playing;
  break;
  }


  }
 
 

class Character {
  constructor(x, y, width, height, spriteSheet, animations) {
    this.sprite = new Sprite(x, y, width, height);
    this.sprite.spriteSheet = spriteSheet;
 
    this.sprite.anis.frameDelay = 8;
    this.sprite.addAnis(animations);
    this.sprite.changeAni('stand');
  }
 
  stop() {
    this.sprite.vel.x = 0;
    this.sprite.vel.y = 0;
    this.sprite.changeAni('stand');
  }
 
  walkRight() {
    this.sprite.changeAni('walkRight');
    this.sprite.vel.x = 1; // Adjust speed as needed
    this.sprite.scale.x = 1;
    this.sprite.vel.y = 0;
  }
 
  walkLeft() {
    this.sprite.changeAni('walkRight');
    this.sprite.vel.x = -1; // Adjust speed as needed
    this.sprite.scale.x = -1;
    this.sprite.vel.y = 0;
  }
 
  walkUp() {
    this.sprite.changeAni('walkUp');
    this.sprite.vel.y = -1; // Adjust speed as needed
    this.sprite.vel.x = 0;
  }
 
  walkDown() {
    this.sprite.changeAni('walkDown');
    this.sprite.vel.y = 1; // Adjust speed as needed
    this.sprite.vel.x = 0;
  }
 
  display() {
    this.sprite.update();
    this.sprite.position.x += this.sprite.vel.x;
    this.sprite.position.y += this.sprite.vel.y;
    this.sprite.display();
  }
}

