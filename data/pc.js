app.get.images =
[
	'right'
];

app.scene.run = function ()
{
	app.scene.load ('test');
}

app.scene.test = function ()
{
	app.wipe ();

	app.create.saver ({ delay: 1000, tags: ['box', 'button'] }).load ();

	let cx = 0.5 * window.innerWidth;
	let cy = 0.5 * window.innerHeight;

	let red_box_h = 100;
	let red_box_w = 100;

	let red_box_x = cx - 0.5 * red_box_w;
	let red_box_y = cy - 0.5 * red_box_h;
	
	let red_box = app.create.box
	({
		color: '#f00',
		h: red_box_h,
		id: 'red_box',
		x: red_box_x,
		y: red_box_y,
		w: red_box_w
	});
	red_box.load ();

	let right_h = 50;
	let right_w = 50;

	let right_x = red_box_x + red_box_w;
	let right_y = red_box_y + 0.5 * (red_box_h - right_h);

	let right = app.create.button
	({
		action: function ()
		{
			let d = 10;
			red_box.set.x = red_box.x + d;
			right.set.x = right.x + d;
		},
		h: right_h,
		i: app.i.right,
		id: 'right',
		x: right_x,
		y: right_y,
		w: right_w
	})
	right.load ();

	app.create.button
	({
		action: function ()
		{
			app.scene.load ('test1');
		},
		h: 100,
		i: app.i.right,
		x: 0,
		y: 0,
		w: 100
	}).load ();

	app.base.load ();
}

app.scene.test1 = function ()
{
	app.wipe ();

	app.create.button
	({
		action: function ()
		{
			app.scene.load ('test');
		},
		h: 100,
		i: app.i.right,
		x: 0,
		y: 0,
		w: 100
	}).load ();
}