$(document).ready(function() {
	var delay = 1000.0 / 60.0;
	var keys = [];
	var entities = [];
	
	var loops = 0;
	var nextGameTick = (new Date()).getTime();
	var j = 0;
	var num = 0;
	
	var levelLoaded = false;
	
	var speed = 1, dist = 0, k = 0;
	
	function random(i) {
		return Math.floor(Math.random() * i);
	}
	
	window.onunload = function() {
		clearInterval();
	};
	
	window.onload = function() {
		var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

		if (animFrame !== null) {
			var recursiveAnim = function() {
				run();
				animFrame(recursiveAnim);
			};

			animFrame(recursiveAnim);
		} else {
			setInterval(run, delay);
		}
		
		if(!levelLoaded) {
			addEntity(new Player());
		}
	};
	
    $(document).keydown(function(key) {
		keys[key.which] = true;
	});
	
	$(document).keyup(function(key) {
		keys[key.which] = false;
	});
	
	function run() {
		loops = 0;
    
		while((new Date()).getTime() > nextGameTick) {
			tick();
			nextGameTick += delay;
			loops++;
		}
	}
	
	function tick() {
		$('.background').animate({left: '-=' + speed + 'px'}, 0);
		$('.background2').animate({left: '-=' + speed + 'px'}, 0);
		$('.background3').animate({left: '-=' + speed + 'px'}, 0);
		$('.background4').animate({left: '-=' + speed + 'px'}, 0);
		$('.background5').animate({left: '-=' + speed + 'px'}, 0);
		j+=speed;
		if(j >= 1800) {
			$('.background').animate({left: '+=' + j + 'px'}, 0);
			$('.background2').animate({left: '+=' + j + 'px'}, 0);
			$('.background3').animate({left: '+=' + j + 'px'}, 0);
			$('.background4').animate({left: '+=' + j + 'px'}, 0);
			$('.background5').animate({left: '+=' + j + 'px'}, 0);
			j = 0;
		}
		
		for(var i = 0; i < entities.length; i++) {
			var e = entities[i];
			e.tick();
			
			if(e.removed) {
				removeEntity(i);
				i--;
			}
		}
		
		if(random(Math.max(90 - (speed * 10), 10)) === 0) {
			addEntity(new Asteroid());
		}
		
		if(k >= 1000 * speed) {
			speed++;
			k = 0;
		}
		
		dist += speed;
		k += speed;
		
		$('#dist').html(dist + "m");
	}
	
	function addEntity(entity) {
		entities.push(entity);
		num++;
	}
	
	function removeEntity(i) {
		entities.splice(i,1);  
	}
	
	function Entity() {
		this.removed = false;
		
		this.collide = function(entity) {
			return !(entity.position.top > this.position.top + this.height || entity.position.top + entity.height < this.position.top || 
					 entity.position.left > this.position.left + this.width || entity.position.left + entity.width < this.position.left);
		};
		
		this.collided = function(entity) {
		};
		
		this.heal = function(amount) {
		};
		
		this.getName = function() {
		};
		
		this.checkCollision = function() {
			for(var i = 0; i < entities.length; i++) {
				if(entities[i] === this) {
					continue;
				}
				if(entities[i].collide(this)) {
					entities[i].collided(this);
				}
			}
		};
	}

	function Asteroid() {
		if(random(2)) {
			$('#health-cell').before("<img id='a" + num + "' class='asteroid' src='asteroid.png'></img>");
		} else {
			$('#health-cell').before("<img id='a" + num + "' class='asteroid' src='asteroid2.png'></img>");
		}
		this.img = $('#a' + num);
		
		this.size = 40 + random(30);
		this.width = this.size;
		this.height = this.size;
		
		this.xa = random(3) + 1;
		this.ya = 0;

		this.img.css({"width": this.size + "px","height": this.size + "px", "top": (20 + random(410 - this.size)) + "px"});
		this.position = this.img.position();
		
		this.removing = 0;
		
		if(random(2)) {
			var t = random(4) + 1;
			this.img.css({
				"-webkit-animation": "spin-right " + t + "s linear infinite",
				"-moz-animation": "spin-right " + t + "s linear infinite",
				"-ms-animation": "spin-right " + t + "s linear infinite",
				"-o-animation": "spin-right " + t + "s linear infinite",
				"animation": "spin-right " + t + "s linear infinite"
			});
		} else {
			var t = random(4) + 1;
			this.img.css({
				"-webkit-animation": "spin-left " + t + "s linear infinite",
				"-moz-animation": "spin-left " + t + "s linear infinite",
				"-ms-animation": "spin-left " + t + "s linear infinite",
				"-o-animation": "spin-left " + t + "s linear infinite",
				"animation": "spin-left " + t + "s linear infinite"
			});
		}

		this.collided = function(entity) {
			if(this.removing > 0) {
				return false;
			} else if(entity.getName() == "BULLET") {
				entity.heal(-100);
				this.removing = 1;
			} else {
				this.ya = random(2) + 1;
				if(this.position.top + this.height / 2 < entity.position.top + entity.height / 2) {
					this.ya *= -1;
				}
				
				if(entity.getName() == "PLAYER") {
					entity.heal(-100);
					this.removing = 1;
					this.ya *= 2;
				}
			}
		};
		
		this.tick = function() {
			this.img.animate({left: '-=' + (this.xa + speed) + 'px', top: '+=' + this.ya + 'px'}, 1);
			this.position.left -= (this.xa + speed);
			this.position.top += this.ya;
			
			if(this.removing > 40) {
				this.removed = true;
				this.img.remove();
			}
			if(this.removing > 0) {
				this.removing++;
				this.img.animate({opacity: '-=0.025'}, 1);
			}
			
			if(this.position.left + this.size < 0) {
				this.removed = true;
				this.img.remove();
			}
			
			this.checkCollision();
		};
		
		this.getName = function() {
			return "ASTEROID";
		};
	}
	Asteroid.prototype = new Entity();
	
	function Player() {
		$('#health-cell').before("<img id='spaceship' src='spaceship0.png'></img>");
		this.img = $('#spaceship');
		this.position = this.img.position();
		
		this.width = 105;
		this.height = 42;
		
		this.cool_down = 0;
		
		this.health = 300;
		
		var invi = 0;
	
		this.tick = function() {
			if((keys[38] || keys[87]) && this.position.top - 3 > 20) {
				this.img.animate({top: '-=3px'}, 1);
				this.position.top -= 3;
			}
			if((keys[40] || keys[83]) && this.position.top + 45 < 430) {
				this.img.animate({top: '+=3px'}, 1);
				this.position.top += 3;
			}
			
			if(this.cool_down > 0) {
				this.cool_down--;
			}
			
			if(keys[32] && this.cool_down === 0) {
				addEntity(new Bullet(this.position.top));
				this.cool_down = 20;
			}
			
			this.checkCollision();
			invi--;
		};
		
		var prev = 298;
		
		this.heal = function(amount) {
			if(invi > 0) return;
			this.health += amount;
			if(this.health < 0) {
				this.health = 0;
			} else if(this.health > 300) {
				this.health = 300;
			}
			
			$('#health-bar').animate({width: '+=' + (Math.floor(this.health / 300 * 298) - prev) + 'px'}, delay * 20);
			invi = 20;
			prev = Math.floor(this.health / 300 * 298);
			var i = 0;
			if(this.health >= 0 && this.health <= 100) i = 2;
			if(this.health > 100 && this.health <= 200) i = 1;
			if(this.health > 200 && this.health <= 300) i = 0;
			this.img.attr('src', 'spaceship' + i + '.png');
		};
		
		var b1 = new Box(60, 20, 45, 17);
		var b2 = new Box(39, 14, 21, 24);
		var b3 = new Box(0, 0, 39, 41);
		
		this.collide = function(entity) {
			return b1.collide(entity, this.position) || b2.collide(entity, this.position) || b3.collide(entity, this.position);
		};
		
		this.getName = function() {
			return "PLAYER";
		};
	}
	Player.prototype = new Entity();
	
	function Bullet(x) {
		$('#health-cell').before("<div id='b" + num + "' class='bullet'></img>");
		this.img = $('#b' + num);
		this.img.css({"top": (x + 33) + "px"});
		this.position = this.img.position();
		
		this.width = 20;
		this.height = 2;
		
		this.xa = 4;

		this.tick = function() {
			this.img.animate({left: '+=' + (this.xa + speed) + 'px'}, 1);
			this.position.left += (this.xa + speed);
			
			if(this.position.left > 650) {
				this.removed = true;
				this.img.remove();
			}
			
			this.checkCollision();
		};
		
		this.heal = function(amount) {
			this.removed = true;
			this.img.remove();
		};
		
		this.getName = function() {
			return "BULLET";
		};
	}
	Bullet.prototype = new Entity();
	
	function Box(xo, yo, width, height) {
		this.width = width;
		this.height = height;
		this.xo = xo;
		this.yo = yo;
		
		this.collide = function(entity, pos) {
			return !(entity.position.top > pos.top + yo + this.height || entity.position.top + entity.height < pos.top + yo || 
					 entity.position.left > pos.left + xo + this.width || entity.position.left + entity.width < pos.left + xo);
		};
	}
});