var gameProperties = {
    screenWidth: 1250, //screeen siiiiiize
    screenHeight: 600,
};

var states = {
    game: "game",
};

//adding assets or adding photos that we will make move during the game. 
var graphicAssets = { //creating a graphicAssets object with 5 properties or parts. 
    ship: { URL: 'assets/spaceship.png', name: 'ship' }, //ship 
    bullet: { URL: 'assets/bullet.png', name: 'bullet' }, //bullets or what ship will shoot. 

    shipLarge: { URL: 'assets/shipLarge.png', name: 'shipLarge' }, //big astroid
    shipMedium: { URL: 'assets/shipMedium.png', name: 'shipMedium' }, //medium astriod
    shipSmall: { URL: 'assets/shipSmall.png', name: 'shipSmall' }, //small enemyShips
};

//properties of the ship object. 
var shipProperties = {
    //whenever the ship resets the x and y position 
    startX: gameProperties.screenWidth * 0.5,
    startY: gameProperties.screenHeight * 0.5,

    acceleration: 300, //how fast ship increases in velocity
    drag: 100, //friction that slows down ship when button stop pressed
    maxVelocity: 300, //maximum speed. 
    angularVelocity: 200, //how fast ship will be able to rotate. 

    startingLives: 5, //how many lives you start with
    timeToReset: 5, //times to die to reset. 
};

//properties of bullets 
var bulletProperties = {
    speed: 400, // speed of bullets
    interval: 100, //firing rate of bullets
    lifespan: 2000, //how long they last on screen
    maxCount: 50, //how many bullets can be on screen at a time. 
}

//property of Enemy ships
var enemyShipProperties = {
    startingEnemyShips: 20, //starts off with 20 ships
    maxEnemyShips: 50, //max number of enemyShipss on screen is 20
    numberOfEnemyShipsToAppear: 2, //2 enemyShipss appear at a time

    //this is the velocity of the ships and in which direction the go. and how many points they are. 
    //differ from large medium and small ship
    //Was going to add point system to the game but couldnt figure it out in tutorial.
    //also added the pieces to the ship large and medium
    shipLarge: {
        minVelocity: 50, //minVelocity, means the minimum velocity of the Large ship
        maxVelocity: 150, //maxVelocity the maximum velocity of larg ship
        minAngularVelocity: 0, //minimum rotation velocity of large ship
        maxAngularVelocity: 200, //maximum rotation velocity of large ship
        score: 20, //points earned by killing large ship
        nextSize: graphicAssets.shipMedium.name, //when larged ship is destroyed it will turn into two pieces of the medium ship
        pieces: 2
    },
    shipMedium: {
        minVelocity: 50, //minVelocity, means the minimum velocity of the medium ship
        maxVelocity: 200, //maximum velocity of medium ship
        minAngularVelocity: 0, //minimum rotation velocity of medium ship
        maxAngularVelocity: 200, //maxium rotation velocity of medium ship
        score: 50, //points earned killing medium ship
        nextSize: graphicAssets.shipSmall.name, //when the medium ship is destroyed it will turn into two small ships. 
        pieces: 2
    },
    shipSmall: {
        minVelocity: 50, //min Velocity, means the minimum velocity of the small ship 
        maxVelocity: 300, //maximum Velocity of small ship.
        minAngularVelocity: 0, //minimum rotation velocity of small ship 
        maxAngularVelocity: 200, //maximum rotation velocity of small ship
        score: 100
    }, //points earned killing small ship
    //no next size because this is the smallest ship. 
};

//adds font to the tf_lives to show how much life you have left/points.
var fontAssets = {
    counterFontStyle: { font: '20px Arial', fill: '#FFFFFF', align: 'center' },
};

var gameState = function(game) {
    //new property in gameState object called shipSprite references our ship player
    this.shipSprite;

    //controls for ship 
    this.key_left; //key to left
    this.key_right; //key to right
    this.key_thrust; //ket to thrust 

    //controls the bullets and how they are fired. 
    this.key_fire;
    this.bulletGroup;
    this.bulletInterval = 0;

    //makes it so enemyShips group and amount of enemyShipss and all properties appear in the game world. 
    this.shipParty;
    this.shipCount = enemyShipProperties.startingEnemyShips;

    //the good guy ship add its properties and lives 
    this.shipLives = shipProperties.startingLives;
    this.tf_lives;
};

gameState.prototype = {
    //loading images from above into our game state. 
    /*game.load method is used to load all external contect like pics and images or even music and sound. */
    preload: function() {
        game.load.image("platForm", "assets/platform.png")
        game.load.image(graphicAssets.shipLarge.name, graphicAssets.shipLarge.URL); //loading large enemyShips into game state. 
        game.load.image(graphicAssets.shipMedium.name, graphicAssets.shipMedium.URL); //loading medium enemyShips into game state.
        game.load.image(graphicAssets.shipSmall.name, graphicAssets.shipSmall.URL); //loading smenemyShips into gamestate

        game.load.image(graphicAssets.bullet.name, graphicAssets.bullet.URL); //loading bullet png into game state
        game.load.image(graphicAssets.ship.name, graphicAssets.ship.URL); //loading ship png into game state

    },

    create: function() {
        this.platForm = game.add.sprite
        this.initGraphics(); //create the function into game
        this.initPhysics(); //create the function into game
        this.initKeyboard(); //create the function into game
        this.resetenemyShipss(); //create the function into the game.

    },



    initPhysics: function() { //adding the physics to the game. and putting it into function. 
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);
        this.shipSprite.body.drag.set(shipProperties.drag);
        this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);
    },

    //adding the keyboard button functions from the sprite ship
    //this connects to the gamestate function above. 
    initKeyboard: function() {
        this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT); //press left this happens
        this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT); //pres right this happens
        this.key_thrust = game.input.keyboard.addKey(Phaser.Keyboard.UP); //press up adds velocity
        this.key_fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); //spacebar happens, shoot.
    },

    checkPlayerInput: function() {
        if (this.key_left.isDown) { //if the left key is pushed down
            this.shipSprite.body.angularVelocity = -shipProperties.angularVelocity; //the angularVelocity is initiated
        } else if (this.key_right.isDown) { //if the right key is pushed down
            this.shipSprite.body.angularVelocity = shipProperties.angularVelocity; //the angularVelocity is initiated 
        } else {
            this.shipSprite.body.angularVelocity = 0; //ship doesnt move or glides with initial velocity
        }

        if (this.key_thrust.isDown) { //if the up button is pushed down. 
            game.physics.arcade.accelerationFromRotation(this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration); //then accelerated in the direction of left or right.
        } else {
            this.shipSprite.body.acceleration.set(0); //else no acceleration
        }

        if (this.key_fire.isDown) { //if the space bar is pressed, fire function is called. 
            this.fire();
        }
    },

    /*this function makes sure that if the ship or enemyShipss goes outside
    the relm of the game, it will reapear on the opposite side. */
    checkBoundaries: function(sprite) { //passes in sprite in our argument so that it applies to any sprite in the game world. 
        if (sprite.x < 0) {
            sprite.x = game.width;
        } else if (sprite.x > game.width) {
            sprite.x = 0;
        }

        if (sprite.y < 0) {
            sprite.y = game.height;
        } else if (sprite.y > game.height) {
            sprite.y = 0;
        }
    },


    //fire function!!!!!! to fire weopens!!!!!
    fire: function() {
        if (game.time.now > this.bulletInterval) { //validating what happens when you fire bullets
            //check before is current internal game clock has passed the bulletInterval.
            var bullet = this.bulletGroup.getFirstExists(false); //getFirstExists function to get the first object in bulletGroup.
            //set false retrieves an object that dont exist in game, if the argument was true, it would retrieve currently existing
            //in game. 

            //if bullets are in game world and exeeds the limit given then you will not be able to fire more bullets. 
            if (bullet) {
                var length = this.shipSprite.width * 0.5; //half size of ship, positions bullet to come out in front of ship. 
                var x = this.shipSprite.x + (Math.cos(this.shipSprite.rotation) * length); //calculates the exact location or cordinates
                //of bullets based on where they are shot from in the game. based on the length and rotation of ship. 
                var y = this.shipSprite.y + (Math.sin(this.shipSprite.rotation) * length);


                bullet.reset(x, y); //reset makes our bullet move to x and y coordinates as ship moves around the game. 
                bullet.lifespan = bulletProperties.lifespan; //add the life span of the bullets
                bullet.rotation = this.shipSprite.rotation; //adding the rotation to bullets. 

                //VelocityFromRotation set to calculate the speed of bullets. 
                //this will set the x and y velocity of bullet. 
                game.physics.arcade.velocityFromRotation(this.shipSprite.rotation, bulletProperties.speed, bullet.body.velocity);
                this.bulletInterval = game.time.now + bulletProperties.interval; //bullet interval to tell when we can fire the next round of bullets. 
            }
        }
    },


    //creating the enemy ships to pop up randomly 
    createShips: function(x, y, size) { //always 3 paremeters have to be passed for anything in the game which is the x and y 
        //cordinates and the size of the images. 
        var enemyShips = this.shipParty.create(x, y, size); //creates the enemy ships
        enemyShips.anchor.set(0.5, 0.5); //anchor set at the x and y of .5 of image . 
        enemyShips.body.angularVelocity = game.rnd.integerInRange(enemyShipProperties[size].minAngularVelocity, enemyShipProperties[size].maxAngularVelocity);
        //adding the velocity
        var randomAngle = game.math.degToRad(game.rnd.angle()); //ading the random movements of the enemy shipss. 
        var randomVelocity = game.rnd.integerInRange(enemyShipProperties[size].minVelocity, enemyShipProperties[size].maxVelocity);

        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, enemyShips.body.velocity); //bringing it to game world. 
    },

    //value of size passed into createShip function. enemyShips grapjic assets from graphicAssets
    createShips: function(x, y, size, pieces) {


        //adding a paremeter called pieces, if no argument is passed then pieces is given value of 1. 
        if (pieces === undefined) { pieces = 1; } //=== is a SCRICT comparison operator. object must have same type.

        for (var i = 0; i < pieces; i++) {
            var enemyShips = this.shipParty.create(x, y, size);
            enemyShips.anchor.set(0.5, 0.5);
            //game.rndintegerInRang function returns a random number and needs two arguments which are maximum number
            //and the minimum number.
            enemyShips.body.angularVelocity = game.rnd.integerInRange(enemyShipProperties[size].minAngularVelocity, enemyShipProperties[size].maxAngularVelocity);
            //sets enemy ships physics body to roatat at a random velocity that is between the range given above
            //of the maximumvelocity and minimum velocity
            var randomAngle = game.math.degToRad(game.rnd.angle());
            var randomVelocity = game.rnd.integerInRange(enemyShipProperties[size].minVelocity, enemyShipProperties[size].maxVelocity);

            game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, enemyShips.body.velocity);
        }
    },



    resetenemyShipss: function() { //ship count, number of ships that can be on screen that i declared earlier. 
        for (var i = 0; i < this.shipCount; i++) { //for loop for creating a number of enemy ships at randomly given positions.
            var side = Math.round(Math.random()); //we added code on earlier for side, enemyShips can apear now on random sides
            //of the screen with the math.round(math.random()).
            //way above we did that pieces is either equal to 1 or undefined, the math.round will now round it to either 1 or 0. depending
            //on if the value is .5 or below .5.
            var x; //declaring 2 variables that will be passed below 
            var y;

            if (side) { //if(side) stands for if side is true. 
                x = Math.round(Math.random()) * gameProperties.screenWidth; //same code as above except now its being multiplied 
                //by gameProperties.screenWidth. We do this to set our x at the 0 position or the full width of game world. 
                y = Math.random() * gameProperties.screenHeight; //this sets our y within range of 0 to the full height of game world.
            } else {
                x = Math.random() * gameProperties.screenWidth; //this is same as above except it just swaps the position of
                //x and the position of y. 
                y = Math.round(Math.random()) * gameProperties.screenHeight;
            }

            this.createShips(x, y, graphicAssets.shipLarge.name); //creates ships at random parts of the screen. 
        }
    },

    enemyShipsCollision: function(target, enemyShips) {
        target.kill();
        enemyShips.kill();

        //adding the destroy ship function below
        //if enemyShips hits ship destroy ship function is called. 
        if (target.key == graphicAssets.ship.name) {
            this.destroyShip();
        }

        this.splitenemyShips(enemyShips);
    },

    //function that takes away lives from the screen text if you die 
    destroyShip: function() {
        this.shipLives--;
        this.tf_lives.text = this.shipLives;

        if (this.shipLives) { //if shiplives value is not 0 then in next line we add a time event to reset when time runs out
            //this wasnt finished. so when time runs out you pass level etc. 
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.resetShip, this);
        } //delay, before timer runs out, phaser.time.second has value of 1000, the value is in the miliseconds. 
    },

    //when ship dies it resets and makes you pop up in the middle of the screen where you first started the game. 
    resetShip: function() {
        this.shipSprite.reset(shipProperties.startX, shipProperties.startY);
        this.shipSprite.angle = -90;
    },

    //splits the astroid function
    splitenemyShips: function(enemyShips) {
        if (enemyShipProperties[enemyShips.key].nextSize) {
            this.createShips(enemyShips.x, enemyShips.y, enemyShipProperties[enemyShips.key].nextSize, enemyShipProperties[enemyShips.key].pieces);
        }
    },

    //this function below connects to ship properties into the function of initPhysics.
    //enables the ship sprite properties like the velocity, speed etc that we made above get set into the game. 
    initPhysics: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);
        this.shipSprite.body.drag.set(shipProperties.drag);
        this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);

        this.bulletGroup.enableBody = true;
        this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletGroup.createMultiple(bulletProperties.maxCount, graphicAssets.bullet.name); //The createMultiple function is a group function that creates multiple sprites objects and adds them to our bulletGroup
        this.bulletGroup.setAll('anchor.x', 0.5);
        this.bulletGroup.setAll('anchor.y', 0.5); // The 0.5 argument used represents 50% of our graphic asset’s width and height
        this.bulletGroup.setAll('lifespan', bulletProperties.lifespan); //sets all bullets to the lifespan we set above

        this.shipParty.enableBody = true; //enables the physics body while line 106 assigns the default physics system to use.
        this.shipParty.physicsBodyType = Phaser.Physics.ARCADE;
    },

    update: function() {
        this.checkPlayerInput(); //check player input function validation of buttons presseed and what they do.
        this.checkBoundaries(this.shipSprite); //validation that any sprite in the game field stays on screen etc.
        this.bulletGroup.forEachExists(this.checkBoundaries, this); //makes it so that bullets have same character as ships, when the leave screen the shoot our the opposite side of screen. 
        this.shipParty.forEachExists(this.checkBoundaries, this); //validation for enemyShips added to game world. 


        //if bullets overlap with enemyShips then it calls enemyShips collision function. 
        game.physics.arcade.overlap(this.bulletGroup, this.shipParty, this.enemyShipsCollision, null, this);
        game.physics.arcade.overlap(this.shipSprite, this.shipParty, this.enemyShipsCollision, null, this);

    },

    //adding this.shipSprite into our game world. when we do this we need to pass x and y coordinates of the ship as well 
    //as the picture of image of the ship that will apear in the game. 
    initGraphics: function() {
        this.shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name); //adding ship img to gameworld. 
        this.shipSprite.angle = -90; //-90 will make ship apear facing up. 
        this.shipSprite.anchor.set(0.5, 0.5); //where ship will appear
        this.bulletGroup = game.add.group(); //adds the bullets into game, has zero when game first starts because bullets will not just shoot our when you apear as ship.
        this.shipParty = game.add.group(); //now the enemyShips will use the physics added in the game world. 
        this.tf_lives = game.add.text(20, 10, shipProperties.startingLives, fontAssets.counterFontStyle); //where the text field will be on the screen with style etc. 
    },
};

//this adds everything to the game world, all properties, user controls, pictures etc etc. 
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add(states.game, gameState);
game.state.start(states.game);