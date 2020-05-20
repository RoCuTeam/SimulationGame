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
var ballons = ['Blue', 'Cyan', 'Gold', 'Green', 'Pink', 'Red', 'White', 'Yellow'];
var attacks;
var platforms;
var cursors;

// Variables de musica
let audioMenu;
let audioGame;
let audioDisparo;
let audioChoqueDisparo;
let audioHurtPlayer;
let audioHurtDragon;
let audioLost;
let audioWinning;
let audioCharge;
let audioCollect;
var isMusicGame = false;

// Contadores y banderas
var score = 0;
var health = 5;
var enemiesNum = 0;
var inventory = {
  "polvore": 0,
  "dinamite": 0,
  "shots": 5
}
var coldowns = {
  'tintSecs': 50,
  'attackReload': 30,
  'manaReload': 2000,
  'turnPause': 50,
  'nextEnemy': 500,
  'buildTime': 100
}
// Contadores para recargas o eventos
var tintSecs = 0;
var attackSecs = 0;
var turnPause = 0;
var building = coldowns['buildTime'];
var nextEnemy = coldowns['nextEnemy'];
var manaSecs = coldowns['manaReload'];

var gameOver = false;
var paused = true;
var lastDirection = 'Front';
var loadAttacks = false;

const baseVelocity = 160;

var game = new Phaser.Game(config);

function preload (){
    // Piso
    this.load.image('floor', 'assets/floor.jpg');
    // Paredes y obstaculos
    this.load.image('singleRock', 'assets/rock.png');
    this.load.image('lineRocks2', 'assets/rockLinex2.png');
    this.load.image('lineRocks3', 'assets/rockLinex3.png');
    this.load.image('lineRocks4', 'assets/rockLinex4.png');
    this.load.image('lineRocks', 'assets/rockLine.png');
    this.load.image('columnRocks2', 'assets/rockColumnx2.png');
    this.load.image('columnRocks3', 'assets/rockColumnx3.png');
    this.load.image('columnRocks4', 'assets/rockColumnx4.png');
    this.load.image('columnRocks', 'assets/rockColumn.png');

    //Fortaleza
    this.load.image('column', 'assets/rockColumnx4.png');
    this.load.image('line', 'assets/rockLinex4.png');
    this.load.image('singleEnemy', 'assets/rock.png');

    // Objetos
    this.load.image('tnt', 'assets/dinamite.png');
    this.load.image('polvore', 'assets/polvore.png');
    this.load.spritesheet('fireball', 'assets/fireballSprite.png', { frameWidth: 25, frameHeight: 25 });
    this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 25, frameHeight: 25 });
    // Enemigos
    this.load.spritesheet('ballonBlue', 'assets/enemyBlue.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonCyan', 'assets/enemyCyan.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonGold', 'assets/enemyGold.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonGreen', 'assets/enemyGreen.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonPink', 'assets/enemyPink.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonRed', 'assets/enemyRed.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonWhite', 'assets/enemyWhite.png',  { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ballonYellow', 'assets/enemyYellow.png',  { frameWidth: 32, frameHeight: 48 });
    // Jugador
    this.load.spritesheet('red', 'assets/red.png', { frameWidth: 32, frameHeight: 48 });
    // canvas
    this.load.image('pauseBtn', 'assets/pause.png');
    //Musica
    //this.load.audio('backgroundMusic', ['music/GetOnTheBus.mp3', 'music/GetOnTheBus.ogg']);
    this.load.audio('menuMusic', 'music/IceAndFirePeaceful.mp3');
    this.load.audio('gameMusic', 'music/IceAndFireHeavy.mp3');
    this.load.audio('disparo', 'music/Disparo.mp3');
    this.load.audio('choqueDisparo', 'music/ChoqueDisparo.mp3');
    this.load.audio('hurtPlayer', 'music/HurtPlayer.mp3');
    this.load.audio('hurtDragon', 'music/HurtDragon.mp3');
    this.load.audio('lost', 'music/Lost.mp3');
    this.load.audio('winning', 'music/Winning.mp3');
    this.load.audio('charge', 'music/Charge.mp3');
    this.load.audio('collect', 'music/Collect.mp3');
}

function create (){
    // Marcar los limites del mapa
    this.cameras.main.setBounds(0, 0, 1920, 1080);
    this.physics.world.setBounds(0, 0, 1920, 1080);

    // Imagen del piso, resolucion 1920x1080
    this.add.image(0, 0, 'floor').setOrigin(0);

    // Grupo de elementos estaticos, seran nuestras paredes y obstaculos
    platforms = this.physics.add.staticGroup();
    fortress = this.physics.add.staticGroup();

    // Grupo de paredes y obstaculos en el mapa
    //Fortaleza
    fortress.create(960, 1050, 'singleEnemy');
    fortress.create(835, 976, 'column');
    fortress.create(1085, 976, 'column');
    fortress.create(960, 890, 'line');

    //Cuadrante uno del mapa
    platforms.create(150, 100, 'lineRocks2');       //horizontal, vertical
    platforms.create(700, 500, 'lineRocks');
    platforms.create(150, 600, 'lineRocks3');

    platforms.create(225, 300, 'columnRocks4');
    platforms.create(500, 125, 'columnRocks');
    platforms.create(800, 250, 'columnRocks3');
    platforms.create(1050, 100, 'columnRocks2');
    platforms.create(1000, 300, 'columnRocks2');
    platforms.create(1050, 500, 'columnRocks2');

    //Cuadrante dos del mapa
    platforms.create(870, 30, 'lineRocks3');
    platforms.create(1400, 100, 'lineRocks');
    platforms.create(1700, 80, 'columnRocks3');
    platforms.create(1440, 400, 'columnRocks');
    platforms.create(1815, 350, 'lineRocks4');
    platforms.create(1230, 380, 'lineRocks3');
    platforms.create(1230, 220, 'singleRock');
    platforms.create(1650, 600, 'lineRocks');

    //Cuadrante tres del mapa
    platforms.create(150, 850, 'columnRocks3');
    platforms.create(950, 700, 'columnRocks3');
    platforms.create(400, 600, 'columnRocks');
    platforms.create(450, 970, 'lineRocks4');
    platforms.create(700, 700, 'lineRocks3');
    platforms.create(670, 870, 'columnRocks2');

    //Cuadrante cuatro del mapa
    platforms.create(1200, 700, 'lineRocks4');
    platforms.create(1300, 1000, 'columnRocks3');
    platforms.create(1840, 800, 'lineRocks3');
    platforms.create(1500, 850, 'columnRocks');
    platforms.create(1670, 920, 'lineRocks2');
    platforms.create(1800, 1030, 'columnRocks2');

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
        key: 'turnFront',
        frames: [ { key: 'red', frame: 0 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'turnLeft',
        frames: [ { key: 'red', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'turnRight',
        frames: [ { key: 'red', frame: 8 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'turnBack',
        frames: [ { key: 'red', frame: 12 } ],
        frameRate: 20
    });

    // Animaciones de los enemigos
    for (i in ballons){
      this.anims.create({
        key: ballons[i]+'IDLE',
        frames: this.anims.generateFrameNumbers('ballon'+ballons[i], { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Animación de bola de fuego
    this.anims.create({
      key: 'fireSpin',
      frames: this.anims.generateFrameNumbers('fireball', { start: 0, end: 3 }),
      frameRate: 15,
      repeat: -1
    });
    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
      frameRate: 16
    })

    // Marcador de vida
    for(var i = 1; i <= health; i++){
      $('.health').append('<img id="health'+i+'" src="assets/heart.png" width="30px" height="30px">');
    }

    // Controles: Se asignan los controles para mover a nuestro jugador (W-A-S-D)
    cursors = this.input.keyboard.addKeys({
        up:     Phaser.Input.Keyboard.KeyCodes.W,
        down:   Phaser.Input.Keyboard.KeyCodes.S,
        left:   Phaser.Input.Keyboard.KeyCodes.A,
        right:  Phaser.Input.Keyboard.KeyCodes.D,
        attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
        pause:  Phaser.Input.Keyboard.KeyCodes.P,
        start:  Phaser.Input.Keyboard.KeyCodes.ENTER
    });

    // Elementos que se pueden recolectar
    polvore = this.physics.add.group({
        key: 'polvore',
        repeat: 4,
        setXY: { x: Phaser.Math.Between(0, 1920), y: Phaser.Math.Between(0, 1080) }
    });

    // Enemigos
    enemies = this.physics.add.group();
    // Ataques del jugador
    attacks = this.physics.add.group();

    // Colisiones en el juego
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(polvore, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(platforms, attacks, deleteFireball, null, this);

    // Eventos
    // Si el jugador toca la polvora
    this.physics.add.overlap(player, polvore, collectPolvore, null, this);
    // Si el jugador es tocado por un enemigo
    this.physics.add.collider(player, enemies, hitEnemy, null, this);

    // Si la polvora se sobrepone a una plataforma o a otra polvora
    this.physics.add.overlap(platforms, polvore, movePolvore, null, this);
    this.physics.add.overlap(polvore, polvore, movePolvore, null, this);

    // Si la bola de fuego toca un enemigo
    this.physics.add.overlap(attacks, enemies, dmgEnemy, null, this);

    //Música
    //this.arrowSound = this.sound.add('backgroundMusic', {loop:true});
    //this.arrowSound.play();
    audioMenu = this.sound.add('menuMusic', {loop:true, volume:0.1});
    audioGame = this.sound.add('gameMusic', {loop:true, volume:0.1});
    audioDisparo = this.sound.add('disparo', {volume:0.7});
    audioChoqueDisparo = this.sound.add('choqueDisparo', {volume:0.9});
    audioHurtPlayer = this.sound.add('hurtPlayer', {volume:0.9});
    audioHurtDragon = this.sound.add('hurtDragon', {volume:0.9});
    audioLost = this.sound.add('lost', {volume:0.9});
    audioWinning = this.sound.add('winning', {volume:0.9});
    audioCharge = this.sound.add('charge', {volume:0.9});
    audioCollect = this.sound.add('collect', {volume:0.9});

    this.sound.pauseOnBlur = false;
    audioMenu.play();

    //audioHurtDragon.play();
    //audioWinning.play();
    //audioCharge.play();
}

function update (){
  if(paused == false){

    if(isMusicGame == false){
          audioMenu.stop();
          audioGame.play();
          isMusicGame = true;
    }
    // Si se termino la vida
    if (gameOver){
        return;
    }
    // Movimiento del personaje
    if (cursors.up.isDown){
      lastDirection = 'Back';
      player.setVelocityY(-baseVelocity);

      if (cursors.left.isDown){
        player.setVelocityX(-baseVelocity);
        player.anims.play('left', true);
      }
      else if (cursors.right.isDown){
        player.setVelocityX(baseVelocity);
        player.anims.play('right', true);
      }
      else{
        player.setVelocityX(0);
        player.anims.play('top', true);
      }
    }
    else if(cursors.down.isDown){
      lastDirection = 'Front';
      player.setVelocityY(baseVelocity);
      if (cursors.left.isDown){
        player.setVelocityX(-baseVelocity);
        player.anims.play('left', true);
      }
      else if (cursors.right.isDown){
        player.setVelocityX(baseVelocity);
        player.anims.play('right', true);
      }
      else{
        player.setVelocityX(0);
        player.anims.play('down', true);
      }
    }
    else if (cursors.left.isDown){
      lastDirection = 'Left';
      player.setVelocityY(0);
      player.setVelocityX(-baseVelocity);
      player.anims.play('left', true);
    }
    else if (cursors.right.isDown){
      lastDirection = 'Right';
      player.setVelocityY(0);
      player.setVelocityX(baseVelocity);
      player.anims.play('right', true);
    }

    //Sin movimiento
    if(cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp){
      player.setVelocityX(0);
      player.setVelocityY(0);
      player.anims.play('turn'+lastDirection);
    }
    // Ataque del personaje
    if(cursors.attack.isDown && attackSecs <= 0 && inventory['shots'] > 0){
      audioDisparo.play();
      var fireball = attacks.create(player.x, player.y, 'fireball');
      fireball.setBounce(0);
      fireball.outOfBoundsKill = true;
      if(player.body.velocity.x == 0 && player.body.velocity.y == 0){
        if(lastDirection == 'Right'){
          fireball.setVelocity(baseVelocity*2, 0);
        }
        if(lastDirection == 'Left'){
          fireball.setVelocity(-baseVelocity*2, 0);
        }
        if(lastDirection == 'Back'){
          fireball.setVelocity(0, -baseVelocity*2);
        }
        if(lastDirection == 'Front'){
          fireball.setVelocity(0, baseVelocity*2);
        }
      }
      else{
        fireball.setVelocity(player.body.velocity.x*2, player.body.velocity.y*2);
      }
      fireball.play('fireSpin');
      fireball.allowGravity = false;
      attackSecs = coldowns['attackReload'];
      inventory['shots'] -= 1;
    }
    // Si quiere atacar pero no hay munición
    if(cursors.attack.isDown && inventory['shots'] == 0){
      $('#shots').css('background', 'rgba(127, 0, 0, 0.25)');
      $('#shots').css('border', '1px solid rgba(127, 0, 0, 1)');
    }

    if(cursors.pause.isDown && turnPause == 0){
      $('.pauseGame').fadeIn(100);
      turnPause = coldowns['turnPause'];
      player.setVelocityX(0);
      player.setVelocityY(0);
      player.anims.play('turnFront');
      paused = true;
      this.physics.pause();
    }
    // Actualizar contadores y UI
    updateCounters();
  }
  else{
    if((cursors.start.isDown && turnPause == 0)){
      // (cursors.pause.isDown && turnPause == 0) ||
      $('.pauseGame').fadeOut(100);
      $('.startGame').fadeOut(100);
      turnPause = coldowns['turnPause'];
      player.setVelocity(0, 0);
      paused = false;
      this.physics.resume();
    }
  }
  if(turnPause > 0){
    turnPause -= 1;
  }
}

// Eventos

function collectPolvore (player, stack){
    stack.disableBody(true, true);
    //  Add and update the score
    audioCollect.play();
    score += 10;
    inventory['polvore'] += 1;

    $('.score p').html("Score: " + score);
    $('.inventory #polvore').html('<img src="assets/polvore.png"> X ' + inventory['polvore']);

    if (polvore.countActive(true) === 0){
        //  A new batch of stars to collect
        polvore.children.iterate(function (child) {
            child.enableBody(true, Phaser.Math.Between(0, 1920), Phaser.Math.Between(0, 1080), true, true);
        });
    }
}

function movePolvore(platform, stack){
  stack.disableBody(true, true);
  stack.enableBody(true, Phaser.Math.Between(0, 1920), Phaser.Math.Between(0, 1080), true, true);
}

function hitEnemy (player, enemy){
    audioHurtPlayer.play();
    enemy.disableBody(true, true);
    $('#health' + health).remove();
    health -= 1;
    enemiesNum -= 1;

    if(health <= 0){
      audioLost.play();
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      gameOver = true;
    }
    else{
      tintSecs = coldowns['tintSecs'];
      player.setTint(0xff0000);
    }
}

function dmgEnemy(fireball, enemy){
  fireball.setVelocity(0, 0);
  audioChoqueDisparo.play();
  fireball.play('explosion');
  fireball.on('animationcomplete', (fire)=>{
    fireball.disableBody(true, true);
  });
  enemy.disableBody(true, true);

  enemiesNum -= 1;
  score += 50;
  $('.score p').html("Score: " + score);

  inventory['shots'] += 1;
}

function deleteFireball(platform, fireball){
  audioChoqueDisparo.play();
  fireball.play('explosion');
  fireball.on('animationcomplete', (fire)=>{
    fireball.disableBody(true, true);
  });
}

// Funciones para UI y contadores
function updateCounters(){

  // Si el jugador habia recibido daño
  if(tintSecs != 0){
    tintSecs -= 1;
    if(tintSecs <= 0){
      player.setTint();
    }
  }

  // Si el jugador habia atacado
  if(attackSecs != 0){
    attackSecs -= 1;
  }

  // Si el jugador carga magia
  if(manaSecs <= 0){
    inventory['shots'] += 1;
    manaSecs = coldowns['manaReload'];
  }

  // Reducir contador de magia
  manaSecs -= 1;
  nextEnemy -= 1;

  if(nextEnemy <= 0){
    addBallon();
    nextEnemy = coldowns['nextEnemy'];
  }
  // Recargar la UI
  refreshUI();
}

function addBallon(){
  color = ballons[Phaser.Math.Between(0, 7)];
  var enemy = enemies.create(Phaser.Math.Between(0, 1920), Phaser.Math.Between(0, 1080), 'ballon'+color);
  enemy.setBounce(1);
  enemy.setCollideWorldBounds(true);
  enemy.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
  enemy.play(color+'IDLE');
  enemy.allowGravity = false;
  enemiesNum += 1;
}

function refreshUI(){
  manaPercent = 100 - parseInt((100 / coldowns['manaReload']) * manaSecs);
  $('#shots').html('<img src="assets/fireball.png"> X '+inventory['shots']);
  $('#mana .c100').removeClass();
  $('#mana #manaDisc').addClass('c100 small dark p'+manaPercent);
  $('#mana .c100 span').html(manaPercent+'%');
  $('.elements #ballons').html('Ballons restantes: x '+enemiesNum);
  if(inventory['shots'] > 0){
    $('#shots').css('background', 'rgba(255, 255, 255, 0.25)');
    $('#shots').css('border', '1px solid rgba(255, 255, 255, 1)');
  }
  if(manaPercent == 100 || (manaPercent <= 15 && loadAttacks == true)){
    loadAttacks = true;
    $('#mana .plus1').fadeIn(150);
  }
  else{
    $('#mana .plus1').fadeOut(300);
  }

}

// Banner
function randomBanner(){
  for(var i = 0; i < 25; i++){
    var x = Math.floor(Math.random() * ($(document).width() - 0) + 0);
    var y = Math.floor(Math.random() * ($(document).height() - 0) + 0);
    var rotation = Math.floor(Math.random() * (90 - 0) + 0);
    $('.banner').append('<img class="spirit" src="assets/darkSpirit.png" style="top: '+x+'px; left: '+y+'px; transform: rotate('+rotation+'deg)">');
  }
}

// Screens
function controls(){
  $('.startGame #presentation').fadeOut(50);
  $('.startGame #controls').fadeIn(500);
}

function presentation(){
  $('.startGame #controls').fadeOut(50);
  $('.startGame #presentation').fadeIn(500);
}
