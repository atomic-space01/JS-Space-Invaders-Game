const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreEl');

canvas.width = 1024;
canvas.height = 574;

var audioMove = new Audio();
audioMove.src = './audio/move1.mp3'

var explosionSound = new Audio();
explosionSound.src = './audio/boom1.wav';

var playerFires = new Audio();
playerFires.src = './audio/playerShoots1.mp3';

var invaderFires = new Audio();
invaderFires.src = './audio/invaderShoots1.wav';

var bossFires = new Audio();
bossFires.src = './audio/bossShooting1.mp3';

var bossGetsHit = new Audio();
bossGetsHit.src = './audio/hit1.wav';


class Player {
	constructor() {

		this.velocity = {
			x: 0,
			y: 0,
		}

		this.rotation = 0;
		this.opacity = 1;

		const image = new Image();
		image.src = './img/spaceship.png';
		image.onload = () => {
			const scale = 0.15;
			this.image = image;
			this.width = image.width * scale;
			this.height = image.height * scale;
			this.position = {
				x: canvas.width * 0.5 - this.width * 0.5,
				y: canvas.height - this.height - 20,
		    }
		}
	}

	draw() {
		c.save();
		c.globalAlpha = this.opacity;
		c.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
		c.rotate(this.rotation);
		c.translate(- player.position.x -player.width / 2, - player.position.y - player.height / 2)
		c.drawImage(
			this.image, 
			this.position.x, 
			this.position.y, 
			this.width, 
			this.height
		);
		c.restore();
	}

	update() {
		if (this.image) {
		this.draw();
		this.position.x += this.velocity.x;
		}
	}
}

class Projectile {
	constructor({position, velocity}) {
		this.position = position;
		this.velocity = velocity;

		this.radius = 3;
	}

	draw() {
		c.beginPath();
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		c.fillStyle = 'red';
		c.fill();
		c.closePath();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Particle {
	constructor({position, velocity, radius, color, fades}) {
		this.position = position;
		this.velocity = velocity;

		this.radius = radius;
		this.color = color;
		this.opacity = 1;
		this.fades = fades;
	}

	draw() {
		c.save();
		c.globalAlpha = this.opacity;
		c.beginPath();
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		c.fillStyle = this.color;
		c.fill();
		c.closePath();
		c.restore();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if (this.fades) {
			this.opacity -= 0.01;
		}
	}
}

class InvaderProjectile {
	constructor({position, velocity}) {
		this.position = position;
		this.velocity = velocity;

		this.width = 3;
		this.height = 10;
	}

	draw() {
		c.fillStyle = 'white';
		c.fillRect(this.position.x, this.position.y, this.width, this.height);
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Invader {
	constructor({position, scale = 0.03}) {

		this.velocity = {
			x: 0,
			y: 0,
		}

		this.rotation = 0;

		const image = new Image();
		image.src = './img/invader2.png';
		image.onload = () => {
			this.scale = scale;
			this.image = image;
			this.width = image.width * this.scale;
			this.height = image.height * this.scale;
			this.position = {
				x: position.x,
				y: position.y
		    }
		}
	}

	draw() {
		c.drawImage(
			this.image, 
			this.position.x, 
			this.position.y, 
			this.width, 
			this.height,
		);
	}

	update({velocity}) {
		if (this.image) {
		this.draw();
		this.position.x += velocity.x;
		this.position.y -= velocity.y;
		}
	}

	shoot(invaderProjectiles) {
		invaderProjectiles.push(new InvaderProjectile({
			position: {
				x: this.position.x + this.width / 2,
				y: this.position.y + this.height
			},
			velocity: {
				x: 0,
				y: 5
			}
		}));
	}
}

class Grid {
	constructor() {
		this.position = {
			x: 0,
			y: 0
		}

		this.velocity = {
			x: 3,
			y: 0
		}

		this. invaders = [];

		const columns = Math.floor(Math.random() * 10 + 5);
 		const rows = Math.floor(Math.random() * 5 + 2);

 		this.width = columns * 30;
 		this.height = rows * 30;

		for (let x = 0; x < columns; ++x) {
			for (let y = 0; y < rows; ++y) {
				this.invaders.push(new Invader({
					position: {
						x: x * 30,
						y: y * 30
					}
				}));
			}
		}
	}

	update() {
		this.position.x += this.velocity.x;
		this.position.y = this.velocity.y;

		this.velocity.y = 0;

		if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
			this.velocity.x *= -1;
			this.velocity.y -= 30;
		}
	}
}

class bossProjectile {
	constructor({position, velocity}) {
		this.position = position;
		this.velocity = velocity;
		this.radius = 25;
		this.shadow = 15;
	}

	draw() {
		c.save();
		c.beginPath();
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		c.fillStyle = 'rgba(182, 34, 3, 1)';
		c.shadowColor = 'red';
		c.shadowBlur = this.shadow;
		c.fill();
		c.closePath();
		c.restore();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.shadow -= 0.01;
	}
}

class Boss {
	constructor({position}) {

		this.velocity = {
			x: 3,
			y: 0
		}

		this.HP = 1000;
		this.opacity = 1;


		const image = new Image();
		image.src = './img/invader2.png';
		image.onload = () => {
			this.scale = 0.4;
			this.image = image;
			this.width = image.width * this.scale;
			this.height = image.height * this.scale;
			this.position = {
				x: position.x,
				y: position.y
		    }
		}
	}

	draw() {
		c.save();
		c.globalAlpha = this.opacity;
		c.drawImage(
			this.image, 
			this.position.x, 
			this.position.y, 
			this.width, 
			this.height,
		);
		c.restore();
	}

	update() {
		if (this.image) {
			this.draw();
			this.position.x += this.velocity.x;

			if(this.position.x + this.width >= canvas.width || this.position.x <= 0) {
				this.velocity.x *= -1;
				this.position.y += 50;
			}
		}
	}

	shoot(bossProjectiles) {
		bossProjectiles.push(new bossProjectile({
			position: {
				x: this.position.x + this.width / 2,
				y: this.position.y + this.height - 100 
			},
			velocity: {
				x: Math.random() * 10 - 5,
				y: Math.random() * 12 - 6
			}
		}));
	}
}

const player = new Player();
const boss = new Boss({position: {x: 0, y: -100}});
const bossProjectiles = [];
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

const keys = {
	a: {
		pressed: false,
	},

	d: {
		pressed: false,
	},

	space: {
		pressed: false,
	},
}
let lastKey = '';

let frames = 0;
let randInter = Math.floor((Math.random() * 500) + 500);
let game = {
	over: false,
	active: true,
	stage1: true,
}
let score = 0;

for (let i = 0; i < 100; ++i) {
	particles.push(new Particle({
		position: {
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height
		},
		velocity: {
			x: 0,
			y: 0.3
		},
		radius: Math.random() * 3,
		color: 'white'
	}));
}

function createParticles({object, color, fades}) {
	for (let i = 0; i < 15; ++i) {
		particles.push(new Particle({
			position: {
				x: object.position.x + object.width / 2,
				y: object.position.y + object.height / 2
			},
			velocity: {
				x: (Math.random() - 0.5) * 2,
				y: (Math.random() - 0.5) * 2
			},
			radius: Math.random() * 3,
			color: color || '#BAA0DE',
			fades: true
		}));
	}
}

function changingStage() {
	grids.forEach((grid, gridIndex) => {
		grid.invaders.forEach((invader, i) => {
			createParticles({
				object: invader,
				fades: true
			});
			grid.invaders.splice(i, 1);
		});
		grids.splice(gridIndex, 1);
	});
	game.stage1 = false;
}

function collisionDetected(object1, object2) {
	if (
		object1.position.y - object1.radius <= object2.position.y + object2.height &&
		object1.position.x + object1.radius >= object2.position.x &&
		object1.position.x - object1.radius <= object2.position.x + object2.width &&
		object1.position.y + object1.radius >= object2.position.y
					) {
		return true;
	}
}

function animate() {
	if (!game.active) return;
	requestAnimationFrame(animate);
	let gradient = c.createLinearGradient(0, 0, canvas.width, canvas.height);
	gradient.addColorStop(0, 'black');
	gradient.addColorStop(0.5, '#150529');
	gradient.addColorStop(1, 'black');
	c.fillStyle = gradient;
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.update();
	particles.forEach((particle, partIndex) => {

		if (particle.position.y - particle.radius >= canvas.height) {
			particle.position.x = Math.random() * canvas.width;
			particle.position.y = particle.radius * -1;
		}

		if (particle.opacity <= 0) {
			setTimeout(() => {
				particles.splice(partIndex, 1);
			}, 0);
		} else {
			particle.update();
		}
	});
	invaderProjectiles.forEach((invProjectile, prIndex) => {
		if (invProjectile.position.y + invProjectile.height >= canvas.height) {
			setTimeout(() => {
				invaderProjectiles.splice(prIndex, 1);
			}, 0);
		} else {
			invProjectile.update();			
		}
		// projectile hits player
		if (
			invProjectile.position.y + invProjectile.height >= player.position.y && 
			invProjectile.position.x + invProjectile.width >= player.position.x &&
			invProjectile.position.x <= player.position.x + player.width
			) {

			setTimeout(() => {
				invaderProjectiles.splice(prIndex, 1);
				player.opacity = 0;
				game.over = true;
			}, 0);

			setTimeout(() => {
				game.active = false;
			}, 2000);

			createParticles({
				object: player,
				color: 'white'
			});
		}
	});

	//shooting
	projectiles.forEach((projectile, index) => {
		if(projectile.position.y + projectile.radius <= 0) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			});
		} else {
			projectile.update();
		}
	});

	// invasion fleet
	if (game.stage1) {
		grids.forEach((grid, gridInd) => {
			grid.update();

			// spawning invaders projectiles
			if (frames % 100 === 0 && grid.invaders.length > 0) {
				grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
				invaderFires.play();
		}

			grid.invaders.forEach((invader, i) => {
				invader.update({velocity: grid.velocity});

				// projectiles hit enemy
				projectiles.forEach((projectile, j) => {
					if (
						projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
						projectile.position.x + projectile.radius >= invader.position.x &&
						projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
						projectile.position.y + projectile.radius >= invader.position.y
					) {
						// creating particles
						createParticles({
							object: invader,
							fades: true
						});

						setTimeout(() => {
							const invFound = grid.invaders.find(inv => {
								return inv === invader;
							});

							const projctlFound = projectiles.find(projctl => {
								return projctl === projectile;
							});

							// remove invader & projectile
							if (invFound && projctlFound) {
								explosionSound.play();
								score += 100;
								scoreEl.innerHTML = score;

								grid.invaders.splice(i, 1);
								projectiles.splice(j, 1);

								if (grid.invaders.length > 0) {
									const fstInvader = grid.invaders[0];
									const lastInvader = grid.invaders[grid.invaders.length - 1];

									grid.width = lastInvader.position.x - fstInvader.position.x + lastInvader.width;
									grid.position.x = fstInvader.position.x;
								} else {
									grids.splice(gridInd, 1);
								}
							}
						}, 0);
					}
				});
			});
		});

		// spawning enemies
		if (frames % randInter === 0) {
			grids.push(new Grid());
			randInter = Math.floor((Math.random() * 500) + 500);
		}
	}

	// boss projectiles
	bossProjectiles.forEach((element, index) => {
		if(collisionDetected(element, player)) {
			setTimeout(() => {
				bossProjectiles.splice(index, 1);
				player.opacity = 0;
				game.over = true;
			}, 0);

			setTimeout(() => {
				game.active = false;
			}, 2000);

			createParticles({
				object: player,
				color: 'white'
			});
		}
		if (
			element.position.y + element.radius <= 0 || 
			element.position.y - element.radius >= canvas.height ||
			element.position.x + element.radius <= 0 ||
			element.position.x - element.radius >= canvas.width
			) {
			setTimeout(() => {
				bossProjectiles.splice(index, 1);
			}, 0);
		} else {
			element.update();
		}
	});

	if (score >= 10000) {
		changingStage();
		boss.update();
		projectiles.forEach((projectile, index) => {
			if (collisionDetected(projectile, boss)) {
				bossGetsHit.play();
				boss.HP -= 10;
				projectiles.splice(index, 1);
				if (boss.HP < 1) {
					boss.opacity = 0;
					createParticles({
						object: boss,
						fades: true
					});
					setTimeout(() => {
						game.active = false;
					}, 1000);
				}
			}
		setInterval(() => {
			if (bossProjectiles.length <= 15) {
				bossFires.play();
				boss.shoot(bossProjectiles);
			}
		}, 3000);

		});
	}

	// moving starship
	if (keys.a.pressed && player.position.x >= 0 && lastKey === 'a') {
		player.velocity.x = -5;
		player.rotation = -0.15;
		audioMove.play();
	} else if(keys.d.pressed && player.position.x + player.width <= canvas.width && lastKey === 'd') {
		player.rotation = 0.15;
		player.velocity.x = 5;
		audioMove.play();
	} else {
		player.velocity.x = 0;
		player.rotation = 0;
	}

	++frames;
}

animate();

addEventListener('keydown', ({key}) => {
	if (game.over) return;

	switch(key) {
		case 'a':
			keys.a.pressed = true;
			lastKey = 'a';
			break;
		case 'd':
			keys.d.pressed = true;
			lastKey = 'd';
			break;
		case ' ':
		playerFires.play();
			projectiles.push(new Projectile({
				position: {
					x: player.position.x + player.width / 2,
					y: player.position.y,
				},
				velocity: {
					x: 0,
					y: -10
				}
			}));
			break;
		case 'i':
			console.log('Number of stars: ' + particles.length);
			console.log('Number of grids: ' + grids.length);
			console.log('Number of projectiles: ' + projectiles.length);
			console.log(boss);
			console.log(frames);

			break;
	}
});

addEventListener('keyup', ({key}) => {
	switch(key) {
		case 'a':
			keys.a.pressed = false;
			break;
		case 'd':
			keys.d.pressed = false;
			break;
		case ' ':
			break;
	}
});
