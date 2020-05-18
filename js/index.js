// Configuración del juego
var config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Variables globales de juego
var player;
var stars;
var enemies;
var platforms;
var cursors;

// Contadores y banderas
var score = 0;
var health = 3;
var inventory = {
  "polvore": 0,
  "dinamite": 0,
  "shots": 0
}
var tintSecs = 0;
var gameOver = false;

var game = new Phaser.Game(config);

function preload (){
    // Piso
    this.load.image('floor', 'assets/floor.jpg');
    // Paredes y obstaculos
    this.load.image('singleRock', 'assets/rock.png');
    this.load.image('lineRocks', 'assets/rockLine.png');
    // Objetos
    this.load.image('tnt', 'assets/dinamite.png');
    this.load.image('polvore', 'assets/polvore.png');
    // Enemigos
    this.load.image('enemy', 'assets/enemy1.png');
    // Jugador
    this.load.spritesheet('red', 'assets/red.png', { frameWidth: 32, frameHeight: 48 });
}

function create (){
    // Marcar los limites del mapa
    this.cameras.main.setBounds(0, 0, 1920, 1080);
    this.physics.world.setBounds(0, 0, 1920, 1080);

    // Imagen del piso, resolucion 1920x1080
    this.add.image(0, 0, 'floor').setOrigin(0);

    // Grupo de elementos estaticos, seran nuestras paredes y obstaculos
    platforms = this.physics.add.staticGroup();

    // Grupo de paredes y obstaculos en el mapa
    platforms.create(250, 450, 'singleRock').setScale(1).refreshBody();
    platforms.create(300, 150, 'lineRocks');

    // Crear el personaje
    player = this.physics.add.sprite(0, 0, 'red');

    // El juego será de vista aerea, por lo tanto no habra gravedad
    player.allowGravity = false;
    // Colisionar el personaje con los limites del mundo para que no salga de el
    player.setCollideWorldBounds(true);
    // Hacer que la camara siga a nuestro jugador
    this.cameras.main.startFollow(player);

    // Crear las animaciones del jugador
    // Abajo
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('red', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    // izquierda
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('red', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    // Derecha
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('red', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
    // Arriba
    this.anims.create({
        key: 'top',
        frames: this.anims.generateFrameNumbers('red', { start: 12, end: 15 }),
        frameRate: 10,
        repeat: -1
    });
    // Detenido
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'red', frame: 0 } ],
        frameRate: 20
    });

    // Controles
    // Se asignan los controles para mover a nuestro jugador (W-A-S-D)
    cursors = this.input.keyboard.addKeys({
        up:Phaser.Input.Keyboard.KeyCodes.W,
        down:Phaser.Input.Keyboard.KeyCodes.S,
        left:Phaser.Input.Keyboard.KeyCodes.A,
        right:Phaser.Input.Keyboard.KeyCodes.D
    });

    // Elementos que se pueden recolectar
    polvore = this.physics.add.group({
        key: 'polvore',
        repeat: 2,
        setXY: { x: Phaser.Math.Between(0, 1920), y: Phaser.Math.Between(0, 1080) }
    });

    // Enemigos
    enemies = this.physics.add.group();

    // Colisiones en el juego
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(polvore, platforms);
    this.physics.add.collider(enemies, platforms);

    // Eventos
    // Si el jugador toca la polvora
    this.physics.add.overlap(player, polvore, collectPolvore, null, this);
    // Si la polvora se sobrepone a una plataforma o a otra polvora
    this.physics.add.overlap(platforms, polvore, movePolvore, null, this);
    this.physics.add.overlap(polvore, polvore, movePolvore, null, this);
    // Si el jugador es tocado por un enemigo
    this.physics.add.collider(player, enemies, hitEnemy, null, this);
}

function update (){
    if (gameOver){
        return;
    }

    if(tintSecs != 0){
      tintSecs -= 1;
      if(tintSecs <= 0){
        player.setTint();
      }
    }

    if (cursors.up.isDown){
      player.setVelocityY(-160);
      if (cursors.left.isDown){
        player.setVelocityX(-160);
        player.anims.play('left', true);
      }
      else if (cursors.right.isDown){
        player.setVelocityX(160);
        player.anims.play('right', true);
      }
      else{
        player.setVelocityX(0);
        player.anims.play('top', true);
      }
    }
    else if(cursors.down.isDown){
      player.setVelocityY(160);

      if (cursors.left.isDown){
        player.setVelocityX(-160);
        player.anims.play('left', true);
      }
      else if (cursors.right.isDown){
        player.setVelocityX(160);
        player.anims.play('right', true);
      }
      else{
        player.setVelocityX(0);
        player.anims.play('down', true);
      }
    }
    else if (cursors.left.isDown){
      player.setVelocityY(0);
      player.setVelocityX(-160);
      player.anims.play('left', true);
    }
    else if (cursors.right.isDown){
      player.setVelocityY(0);
      player.setVelocityX(160);
      player.anims.play('right', true);
    }

    //Sin movimiento
    if(cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp){
      player.setVelocityX(0);
      player.setVelocityY(0);
      player.anims.play('turn');
    }
}

function collectPolvore (player, stack){
    stack.disableBody(true, true);
    //  Add and update the score
    score += 10;
    inventory['polvore'] += 1;

    $('.score p').html("Score: " + score);
    $('.inventory #polvore').html('<img src="assets/polvore.png"> X ' + inventory['polvore']);

    if (polvore.countActive(true) === 0){
        //  A new batch of stars to collect
        polvore.children.iterate(function (child) {
            child.enableBody(true, Phaser.Math.Between(0, 1920), Phaser.Math.Between(0, 1080), true, true);
        });

        var enemy = enemies.create(Phaser.Math.Between(0, 1920), Phaser.Math.Between(0, 1080), 'enemy').setScale(0.5);
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-300, 300));
        enemy.allowGravity = false;
    }
}

function movePolvore(platform, stack){
  stack.disableBody(true, true);
  stack.enableBody(true, Phaser.Math.Between(0, 1920), Phaser.Math.Between(0, 1080), true, true);
}

function hitEnemy (player, enemy){
    enemy.disableBody(true, true);
    $('#health' + health).remove();
    health -= 1;

    if(health <= 0){
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      gameOver = true;
    }
    else{
      tintSecs = 50;
      player.setTint(0xff0000);
    }
}
