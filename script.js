


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 1200;
const CANVAS_HEIGHT = canvas.height = 700;
const backgroundScrollSpeeds = [0.2, 0.4, 0.6, 0.8, 1];
const allowedKeys = ['ArrowUp', 'ArrowDown', "Enter"];



let gameSpeed = 5;
let gameFrame = 0;
let obstacles = [];
let score = 0;
let highscore = 0;
let gameOver = false;



class InputHandler {
    constructor(allowedKeys) {
        this.allowedKeys = allowedKeys;
        this.keys = new Set();

        window.addEventListener('keydown', event => {
            if (this.allowedKeys.includes(event.key)) {
                this.keys.add(event.key);
            };
        });
        window.addEventListener('keyup', event => {
            if (this.allowedKeys.includes(event.key)) {
                this.keys.delete(event.key);
            };
        });
    }
}


// layers for different scroll speeds and dynamic background extension
class Layer {
    constructor(image, scroll_Speed) {
        this.x_coord = 0;
        this.y_coord = 0;
        this.width = 2400;
        this.height = 700;
        this.image = image;
        this.scroll_Speed = scroll_Speed;
        this.speed = gameSpeed * this.scroll_Speed;
    }

    // changes the x coord of the transition between two images depending on the game frame
    update() {
        this.x_coord = gameFrame * this.speed % this.width;
    }

    // draws the image two times for seamless transition while scrolling
    draw() {
        ctx.drawImage(this.image, this.x_coord, this.y_coord, this.width, this.height);
        ctx.drawImage(this.image, this.x_coord + this.width, this.y_coord, this.width, this.height);
    }
}

class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 100;
        this.height = 100;
        this.x_coord = 50;
        this.y_coord = gameHeight / 2 - this.height / 2;
        this.image = document.getElementById('playerImage');


    }
    draw() {
        ctx.drawImage(this.image, this.x_coord, this.y_coord, this.width, this.height);

    }

    update(obstacles) {
        obstacles.forEach(obstacle => {
            if (this.x_coord + this.width > obstacle.x_coord && this.x_coord < obstacle.x_coord + obstacle.width) {
                if (this.y_coord + this.height > obstacle.hole_pos + obstacle.hole_dim / 2 || this.y_coord < obstacle.hole_pos - obstacle.hole_dim / 2) {
                    gameOver = true;
                    highscore = Math.max(score, highscore);
                }
            }
        });

        if (input.keys.has('ArrowUp')) {
            this.y_coord = Math.max(this.y_coord - 5, -20);
        }
        if (input.keys.has('ArrowDown')) {
            this.y_coord = Math.min(this.y_coord + 5, this.gameHeight - this.height);
        }
    }
}



class Background {
    constructor(gameWidth, gameHeight, backgroundScrollSpeeds) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        // getting background images for parallax background
        const backgroundImage_1 = document.getElementById('backgroundImage_1');
        const backgroundImage_2 = document.getElementById('backgroundImage_2');
        const backgroundImage_3 = document.getElementById('backgroundImage_3');
        const backgroundImage_4 = document.getElementById('backgroundImage_4');
        this.backgroundImages = [backgroundImage_1, backgroundImage_2, backgroundImage_3, backgroundImage_4];
        this.backgroundLayers = [];
        this.backgroundImages.forEach((image, index) => {
            this.backgroundLayers.push(new Layer(image, backgroundScrollSpeeds[index]));
        });
    }

    update() {
        this.backgroundLayers.forEach(layer => layer.update());
    }

    draw() {
        this.backgroundLayers.forEach(layer => layer.draw());
    }
}

class Obstacle {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.x_coord = this.gameWidth;
        this.width = 75;
        this.height = 828;
        this.image = document.getElementById('obstacleImage');
        this.max_hole_pos = this.gameHeight - this.gameHeight / 6;
        this.min_hole_pos = this.gameHeight / 6;
        this.hole_pos = Math.floor(Math.random() * (this.max_hole_pos - this.min_hole_pos) + this.min_hole_pos);
        this.hole_dim = this.gameHeight / 4;
        this.toDelete = false;
    }

    draw() {
        ctx.drawImage(this.image, this.x_coord, this.hole_pos + this.hole_dim / 2, this.width, this.height);
        ctx.drawImage(this.image, this.x_coord, this.hole_pos - this.height - this.hole_dim / 2, this.width, this.height);
    }

    update() {
        this.x_coord = this.x_coord - 5;
        if (this.x_coord + this.width < 0) {
            this.toDelete = true;
            score++;
        }
    }
}

function handleObstacles(deltaTime) {
    if (obstacleTimer > obstacleInterval) {
        obstacles.push(new Obstacle(CANVAS_WIDTH, CANVAS_HEIGHT));
        obstacleTimer = 0;
    } else {
        obstacleTimer += deltaTime;
    }
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();
    });
    obstacles = obstacles.filter(obstacle => !obstacle.toDelete);
}

function displayText() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 50);
    ctx.fillText('Highscore: ' + highscore, 20, 70);

    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over! Press Enter to Restart', CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2);
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over! Press Enter to Restart', CANVAS_WIDTH / 2 - 150 + 2, CANVAS_HEIGHT / 2);
    }
}

function resetGame() {
    if (gameOver) {
        gameOver = false;
        obstacles = [];
        score = 0;
    }
}


function up_down() {
    input.keys.add("ArrowUp")
}


function up_up() {
    input.keys.delete("ArrowUp")
}

function down_down() {
    input.keys.add("ArrowDown")
}


function down_up() {
    input.keys.delete("ArrowDown")
}

function resetGame() {
    if (gameOver) {
        gameOver = false;
        obstacles = [];
        score = 0;
    }
}

const input = new InputHandler(allowedKeys);
const background = new Background(CANVAS_WIDTH, CANVAS_HEIGHT, backgroundScrollSpeeds);
const player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT);

let lastTime = 0;
let obstacleTimer = 0;
let obstacleInterval = 2000;


function animate(timeStamp) {
    if (!gameOver) {
        gameOver = false;


        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        background.update();
        background.draw();
        player.update(obstacles);
        player.draw();

        handleObstacles(deltaTime);
        displayText();
        gameFrame--;

    }
    else {
        if (input.keys.has('Enter')) {
            resetGame();

        }
    }
    requestAnimationFrame(animate);
};

animate(0);

