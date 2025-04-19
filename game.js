// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

// Create game instance
const game = new Phaser.Game(config);

// Asset paths
const ASSETS = {
  ships: "assets/SpaceShooterAssets/SpaceShooterAssetPack_Ships.png",
  projectiles:
    "assets/SpaceShooterAssets/SpaceShooterAssetPack_Projectiles.png",
  backgrounds:
    "assets/SpaceShooterAssets/SpaceShooterAssetPack_BackGrounds.png",
  miscellaneous:
    "assets/SpaceShooterAssets/SpaceShooterAssetPack_Miscellaneous.png",
};

// Game variables
let player;
let cursors;
let spacebar;
let enemies;
let playerProjectiles;
let enemyProjectiles;
let gameOver = false;
let background;

// Preload game assets
function preload() {
  // Load ships sprite sheet with proper frame sizing
  this.load.spritesheet("ships", ASSETS.ships, {
    frameWidth: 16, // Single ship width
    frameHeight: 16, // Single ship height
    spacing: 0, // Space between frames
    margin: 0, // Space around frames
  });

  this.load.spritesheet("projectiles", ASSETS.projectiles, {
    frameWidth: 8,
    frameHeight: 8,
  });

  // Load explosion sprites
  this.load.spritesheet("explosion", ASSETS.miscellaneous, {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.image("background", ASSETS.backgrounds);
}

// Create game objects
function create() {
  // Add scrolling background
  background = this.add.tileSprite(400, 300, 800, 600, "background");

  // Create explosion animation
  this.anims.create({
    key: "explode",
    frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 3 }),
    frameRate: 12,
    repeat: 0,
    hideOnComplete: true,
  });

  // Create player with specific frame
  player = this.physics.add.sprite(400, 500, "ships", 8); // Using frame 8 for player ship
  player.setScale(3);
  player.setCollideWorldBounds(true);

  // Create groups for projectiles and enemies
  playerProjectiles = this.physics.add.group();
  enemyProjectiles = this.physics.add.group();
  enemies = this.physics.add.group();

  // Set up keyboard input
  cursors = this.input.keyboard.createCursorKeys();
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Set up collisions
  this.physics.add.collider(player, enemies, gameOverHandler, null, this);
  this.physics.add.collider(playerProjectiles, enemies, hitEnemy, null, this);

  // Start spawning enemies
  this.time.addEvent({
    delay: 2000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true,
  });
}

// Update game state
function update() {
  if (gameOver) {
    return;
  }

  // Scroll background
  background.tilePositionY -= 2;

  // Player movement
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  } else {
    player.setVelocityY(0);
  }

  // Shooting
  if (Phaser.Input.Keyboard.JustDown(spacebar)) {
    shoot();
  }
}

// Spawn an enemy
function spawnEnemy() {
  const x = Phaser.Math.Between(50, 750);
  const enemy = enemies.create(x, 0, "ships", 12); // Using frame 12 for enemy ship
  enemy.setScale(3);
  enemy.setVelocityY(100);

  // Remove enemy when it goes off screen
  enemy.checkWorldBounds = true;
  enemy.outOfBoundsKill = true;
}

// Player shooting
function shoot() {
  const projectile = playerProjectiles.create(
    player.x,
    player.y - 20,
    "projectiles",
    0
  );
  projectile.setScale(2);
  projectile.setVelocityY(-400);

  // Remove projectile when it goes off screen
  projectile.checkWorldBounds = true;
  projectile.outOfBoundsKill = true;
}

// Handle enemy hit
function hitEnemy(projectile, enemy) {
  // Create explosion at enemy position
  const explosion = this.add.sprite(enemy.x, enemy.y, "explosion");
  explosion.setScale(3);
  explosion.play("explode");

  // Destroy projectile and enemy
  projectile.destroy();
  enemy.destroy();
}

// Handle game over
function gameOverHandler() {
  gameOver = true;
  this.physics.pause();

  // Create explosion at player position
  const explosion = this.add.sprite(player.x, player.y, "explosion");
  explosion.setScale(3);
  explosion.play("explode");

  // Hide the player
  player.setVisible(false);

  // Display game over text
  this.add
    .text(400, 300, "GAME OVER", {
      fontSize: "64px",
      fill: "#fff",
    })
    .setOrigin(0.5);

  // Add restart text
  this.add
    .text(400, 350, "Press SPACE to restart", {
      fontSize: "32px",
      fill: "#fff",
    })
    .setOrigin(0.5);

  // Add restart functionality
  this.input.keyboard.once("keydown-SPACE", () => {
    this.scene.restart();
    gameOver = false;
  });
}
