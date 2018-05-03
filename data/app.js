app =
{
	a: {},
	audio: { pause: function () {} },

	base:
	{
		load: function ()
		{
			for (let id in app.object)
			{
				if (app.base[id])
				{
					app.object[id] = app.base[id];
					app.object[id].redraw = 1;
				}
			}
		}
	},

	canvas:
	{
		load: function ()
		{
			let canvas = window.document.createElement ('canvas');
				canvas.style.background = '#000';
				canvas.style.left = 0;
				canvas.style.position = 'absolute';
				canvas.style.top = 0;

			canvas.resize = function ()
			{
				this.height = window.innerHeight;
				this.width = window.innerWidth;
				if (app.scene.now) { app.scene[app.scene.now] (); app.base.load (); };
			}

			app.context = canvas.getContext ('2d');
			app.canvas = canvas;
			app.canvas.resize ();
			window.document.body.appendChild (app.canvas);
		}
	},

	create:
	{
		animation: function (_)
		{
			let animation = app.create.sprite (_);
				animation.a = _.a;
				animation.action = _.action || function () {};
				animation.delay = _.delay || app.window.tick;
				animation.loops = _.loops;
				animation.step = _.step || 0;
				animation.steps = 0;
				animation.tag = ['animation'];
				animation.time = _.time || app.window.time;

			animation.animate = function ()
			{
				if (animation.loop ())
				{
					if (app.window.time - animation.time >= animation.delay)
					{
						animation.time = app.window.time;
						if (animation.step >= animation.a.length - 1)
						{
							animation.step = 0;
							animation.steps++;
							if (animation.steps >= animation.loops)
							{
								animation.loop = () => 0;
								return;
							}
						}
						else
						{
							animation.step = animation.step + 1;
						}
						animation.i = animation.a[animation.step];
						animation.trace ();
					}
				}
				else
				{
					animation.action ();
					delete app.object[this.id];
				}
			}

			animation.tick = function ()
			{
				animation.animate ();
			}

			return animation;
		},

		bar: function (_)
		{
			let bar = app.create.box (_);
				bar.max = _.max || 1;
				bar.now = _.now || 0;
				bar.old = undefined;

				bar.draw = function ()
				{
					let k = bar.now / bar.max;
					if (bar.color) { context.fillStyle = bar.color; context.strokeStyle = bar.color; }
					context.clearRect (hwxy.x, hwxy.y, hwxy.width, hwxy.height);
					context.fillRect (hwxy.x, hwxy.y, k * hwxy.width, hwxy.height);
					context.strokeRect (hwxy.x, hwxy.y, hwxy.width, hwxy.height);
				}

				bar.add = function (n)
				{
					if (bar.now + n < 0)
					{
						bar.now = 0;
					} else if (bar.now + n > bar.max)
					{
						bar.now = bar.max;
					} else
					{
						bar.now += n;
					}
				}

				bar.status = function ()
				{
					if (bar.now != bar.old)
					{
						bar.old = bar.now;
						bar.draw ();
					}
				}

				bar.tick = function ()
				{
					bar.status ();
				}

			return bar;
		},

		box: function (_)
		{
			let box = app.create.object (_);
				box.redraw = _.redraw || 1;
				box.tag = ['box'];
				box.z = _.z || 0;

				box.draw = function ()
				{
					if (box.color) { app.context.fillStyle = box.color; }
					app.context.fillRect (box.x, box.y, box.w, box.h);
				}

				box.set =
				{
					set x (x)
					{
						box.trace ();
						box.x = x;
						box.trace ();
					},

					set y (y)
					{
						box.trace ();
						box.y = y;
						box.trace ();
					},

					set z (z)
					{
						box.trace ();
						box.z = z;
						box.trace ();
					}					
				}

				box.trace = function ()
				{
					box.redraw = 1;
					for (let id in app.object)
					{
						if (!app.object[id].redraw && app.get.boxinbox (box, app.object[id]))
						{
							app.object[id].trace ();
						}
					}
				}

			return box;
		},

		button: function (_)
		{
			let button = app.create.sprite (_);
				button.action = _.action || function () {};
				button.in = _.in || function () {};
				button.out = _.out || function () {};
				button.over = 0;
				button.tag = ['button'];

				button.active = function (event)
				{
					if (button.over)
					{
						if (!app.get.pointinbox ({ x: event.x, y: event.y }, button))
						{
							button.over = 0;
							app.canvas.style.cursor = 'default';
							button.out ();
						}
					} else
					{
						if (app.get.pointinbox ({ x: event.x, y: event.y }, button))
						{
							button.over = 1;
							app.canvas.style.cursor = 'pointer';
							button.in ();
						}
					}
				}

				button.mousedown = function (event)
				{
					if (app.get.pointinbox ({ x: event.x, y: event.y }, button))
					{
						button.action ();
					}
				}

				button.mousemove = function (event)
				{
					button.active (event);
				}

				button.mouseup = function (event)
				{
					button.over = 0;
					button.active (event);
				}

			button.active ({type: 'event', x: app.cursor.x, y: app.cursor.y});
			return button;
		},

		cursor: function (_)
		{
			let cursor = app.create.object (_);
				cursor.id = 'cursor';
				cursor.tag = ['cursor'];

			cursor.mousemove = function (event)
			{
				cursor.x = event.x;
				cursor.y = event.y;
				app.cursor.x = cursor.x;
				app.cursor.y = cursor.y;
			}

			return cursor;
		},

		object: function (_)
		{
			let object = _ || {};
				object.id = _.id || app.id++;
				object.tag = ['object'];

			object.load = function ()
			{
				app.object[object.id] = object;
			}

			return object;
		},

		player: function (_)
		{
			let player = app.create.animation (_);
				player.animation = _.animation || {};
				player.speed = _.speed || 1;
				player.tag = ['player', 'unit'];

			player.control = function ()
			{
				player.go.left ();
				player.go.right ();
			}

			player.go =
			{
				left: function ()
				{
					if (app.key.A)
					{
						player.set.x = player.x - player.speed;
						player.a = player.animation.left;
					}
				},

				right: function ()
				{
					if (app.key.D)
					{
						player.set.x = player.x + player.speed;
						player.a = player.animation.right;
					}
				}
			}

			player.tick = function ()
			{
				player.control ();
				player.wait ();
				player.animate ();
			}

			player.wait = function ()
			{
				if (!app.key.W && !app.key.A && !app.key.S && !app.key.D)
				{
					player.a = player.animation.wait;
				}
			}

			return player;
		},

		saver: function (_)
		{
			let saver = app.create.object (_);
				saver.delay = _.delay || app.window.tick;
				saver.tag = ['saver'];
				saver.tags = _.tags || [];
				saver.time = _.time || app.window.time;

			saver.save = function ()
			{
				if (app.window.time - saver.time >= saver.delay)
				{
					saver.time = app.window.time;
					for (let id in app.object)
					{
						if (app.get.tags (app.object[id].tag, saver.tags) > 0)
						{
							app.save (app.object[id]);
						}
					}
				}
			}

			saver.tick = function ()
			{
				saver.save ();
			}

			return saver;
		},

		sound: function (_)
		{
			let sound = app.create.object (_);
				sound.audio = app.play (_.audio, 0, 1);
				sound.delay = _.delay || app.window.tick;
				sound.listener = _.listener || { x: _.x, y: _.y };
				sound.r = _.r || 0.5 * Math.min (window.innerHeight, window.innerWidth);
				sound.source = _.source;
				sound.tag = ['sound'];
				sound.time = _.time || app.window.time;
				sound.volume = _.volume || 0;
				sound.x = _.x;
				sound.y = _.y;

			sound.volumer = function ()
			{
				if (app.window.time - sound.time >= sound.delay)
				{
					sound.time = app.window.time;
					let source = (sound.source) ? app.get.cp (sound.source) : sound;
					let r = app.get.ab (source, sound.listener);
					if (r <= sound.r)
					{
						sound.volume = (1 - r / sound.r).toFixed (2);
					}
				}
				return sound.volume;
			}

			sound.tick = function ()
			{
				sound.audio.volume = sound.volumer ();
			}

			return sound;
		},

		sprite: function (_)
		{
			let sprite = app.create.box (_);
				sprite.aa = _.aa || 0;
				sprite.i = app.get.i (_.i);
				sprite.tag = ['sprite'];

				sprite.draw = function ()
				{
					app.context.imageSmoothingEnabled = sprite.aa;
					app.context.drawImage (sprite.i, sprite.x, sprite.y, sprite.w, sprite.h);
				}

			return sprite;
		},

		text: function (_)
		{
			let text = app.create.box (_);
				text.font = _.font || 'Arial';
				text.size = _.size || 12;
				text.ta = _.ta || 'left';
				text.tag = ['text'];
				text.tb = _.tb || 'bottom'
				text.text = _.text || '';
				text.width = app.context.measureText (text.text).width;

			text.autosize = function ()
			{
				if (text.w)
				{
					app.context.font = text.size + 'px ' + text.font;

					while (Math.abs (text.w - app.context.measureText (text.text).width) > 1)
					{
						if (app.context.measureText (text.text).width > text.w)
						{
							text.size = 0.8 * text.size;
						} else
						{
							text.size = 1.2 * text.size;
						}
						app.context.font = text.size + 'px ' + text.font;
					}
				}
			}

			text.draw = function ()
			{
				text.autosize ();

				if (text.color)
				{
					app.context.fillStyle = text.color;
				}

				app.context.font = text.size + 'px ' + text.font;
				app.context.textAlign = text.ta;
				app.context.textBaseline = text.tb;

				text.max_width = (app.context.measureText (text.text).width > text.width) ? app.context.measureText (text.text).width : text.width;

				let width = (text.w) ? text.w : text.width;
				app.context.clearRect (text.x, text.y - text.size, width, text.size);
				app.context.fillText (text.text, text.x, text.y);
			}

			text.resize = function ()
			{
				text.autosize ();
			}

			text.write = function (value)
			{
				text.text = value;
				text.redraw = 1;
			}

			text.autosize ();

			return text;
		}
	},

	cursor: {},

	draw: function (redraw)
	{
		let layer = {};

		for (let id in app.object)
		{
			if (layer[app.object[id].z] == undefined) { layer[app.object[id].z] = []; }
			if (redraw || app.object[id].redraw) { app.object[id].redraw = 0; layer[app.object[id].z].push (app.object[id]); }
		}

		for (let z in layer)
		{
			for (let id in layer[z])
			{
				layer[z][id].draw ();
			}			
		}
	},

	get:
	{
		a: function (a)
		{
			let animation = (typeof (a) == 'object') ? a : app.a[a];
				animation = (animation) ? animation : {};
			return animation;
		},

		ab: function (a, b)
		{
			return Math.sqrt (Math.pow (a.x - b.x, 2) + Math.pow (a.y - b.y, 2));
		},

		set animations (a)
		{
			for (id in a)
			{
				app.a[id] = [];
				for (let i = 0; i < a[id]; i++)
				{
					let image = new Image ();
						image.src = 'data/' + id + ' ' + i + '.png';
						app.a[id].push (image);
				}
			}
		},

		boxinbox: function (a, b)
		{
			return ((Math.abs (a.x - b.x + 0.5 * (a.w - b.w)) < 0.5 * Math.abs (a.w + b.w)) && (Math.abs (a.y - b.y + 0.5 * (a.h - b.h)) < 0.5 * Math.abs (a.h + b.h)));
		},

		cp: function (o)
		{
			let x = o.x + 0.5 * o.w;
			let y = o.y + 0.5 * o.h;
			return { x: x, y: y };
		},

		cx: function (w)
		{
			return 0.5 * (window.innerWidth - w);
		},

		cy: function (h)
		{
			return 0.5 * (window.innerHeight - h);
		},

		i: function (i)
		{
			let image = (typeof (i) == 'object') ? i : app.i[i];
				image = (image) ? image : new Image ();
			return image;
		},

		set images (i)
		{
			for (let n of i)
			{
				let image = new Image ();
					image.src = 'data/' + n + '.png';
				app.i[n] = image;
			}
		},

		pointinbox: function (p, b)
		{
			return ((p.x > b.x) && (p.x < b.x + b.w) && (p.y > b.y) && (p.y < b.y + b.h));
		},

		tags: function (t0, t1)
		{
			let tags = 0;
			for (let tag0 of t0)
			{
				for (let tag1 of t1)
				{
					tags += (tag0 == tag1) ? 1 : 0;
				}
			}
			
			return tags;
		}
	},

	i: {},
	id: 0,

	key:
	{
		update: function (event)
		{
			if (event.type == 'keydown')
			{
				app.key[String.fromCharCode (event.keyCode)] = 1;
			}
			if (event.type == 'keyup')
			{
				app.key[String.fromCharCode (event.keyCode)] = 0;
			}
		}
	},

	load: function ()
	{
		app.window.load ();
		app.canvas.load ();
		app.scene.load ('run');
	},

	play: function (src, volume, loop)
	{
		let audio = new Audio ();
			audio.loop = loop;
			if (loop == -1)
			{
				app.audio = audio;
				audio.loop = 1;
			}
			audio.src = src;
			audio.currentTime = 0;
			audio.volume = volume || 1;
			audio.play();

		return audio;		
	},

	object: {},

	save: function (o)
	{
		app.base[o.id] = o;
		return o;
	},

	scene:
	{
		load: function (scene)
		{
			app.scene.now = scene;
			app.scene[scene] ();
		}
	},

	update: function (event)
	{
		app.key.update (event);
		for (let id in app.object)
		{
			for (let method in app.object[id])
			{
				if (method == event.type)
				{
					app.object[id][method] (event);
				}
			}
		}
	},

	window:
	{
		load: function ()
		{
			window.onkeydown = app.update;
			window.onkeyup = app.update;
			window.onmousedown = app.update;
			window.onmousemove = app.update;
			window.onmouseup = app.update;
			window.onresize = function (event) { app.canvas.resize (); app.update (event); app.draw (); }
			app.window.ontick (app.update);
		},

		ontick: function (update)
		{
			window.setInterval
			(
				function ()
				{
					app.window.time += app.window.tick;
					app.update ({ type: 'tick' });
					app.draw ();
				}
			);
		},

		tick: 25,
		time: 0
	},

	wipe: function ()
	{
		app.object = {};
		app.canvas.style.cursor = 'default';
		app.context.clearRect (0, 0, app.canvas.width, app.canvas.height);
		app.create.cursor ({}).load ();
		if (app.audio.play != undefined)
		{
			app.audio.pause ();
		}
	}
}

window.onload = app.load;