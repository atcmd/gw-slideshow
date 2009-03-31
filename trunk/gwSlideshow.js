$.fn.gwSlideshow = function(options)
{
	// First, prime the style and variables we will need throughout
	var opts = $.extend({
		width  : '300px',
		height : '80px',
		border : '1px solid #000000',
		bg_color : '#ffffff',
		delay : 5000,
		transition : 'fade',
		transition_speed : 500,
		start : 0,
		shuffle : false
	}, options);
	
	// Set up the visibility and layout of the containment unit
	$(this).css({
		width  : opts.width,
		height : opts.height,
		border : opts.border,
		backgroundColor : opts.bg_color,
		position : 'relative',
		overflow : 'hidden'
	});
	
	if (opts.float)
	{
		$(this).css('float', opts.float);
	}
	
	// Find all slides and set them up for rotation
	var slides = [];
	$(this).children('div').each(function()
	{
		if ($(this).hasClass('slide'))
		{
			var s = $(this).css({
				width  : opts.width,
				height : opts.height,
				backgroundColor : opts.bg_color,
				position : 'absolute',
				top  : 0,
				left : 0,
				overflow : 'hidden',
				zIndex : 1
			}).hide();
			
			slides.push(s);
		}
	});

	// Now, let's set up the functions we will need for the rotations
	
	/**
	 * Shuffle the slide array
	 *
	 * @return void
	 */
	function shuffle()
	{
		var o = slides;
		for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		slides = o;
	}
	
	/**
	 * Shows the next (+1) slide in the array
	 *
	 * @param {int} num The key of the currently visible slide
	 * @return void
	 */
	function showNext(num)
	{
		var next = num + 1;
		if (next == slides.length)
		{
			next = 0;
		}
		
		doRotation(num, next);
	}
	
	/**
	 * Shows the previous (-1) slide in the array
	 *
	 * @param {int} num The key of the currently visible slide
	 * @return void
	 */
	function showPrev(num)
	{
		var next = num - 1;
		if (next < 0)
		{
			next = slides.length;
		}
		
		doRotation(num, next);
	}
	
	/**
	 * Fades from slide num1 to num2 and performs provided callback upon completion
	 *
	 * @param {int} num1 The slide to fade out
	 * @param {int} num2 The slide to fade in
	 * @param {function} callback Optional callback function to execute
	 * @return void
	 */
	function doFade(num1, num2, callback)
	{
		slides[num1].fadeOut('slow');
		slides[num2].fadeIn('slow', callback);
	}
	
	/**
	 * Slides slide num2 over the currently visible slide
	 *
	 * @param {int} num The slide to display
	 * @param {function} callback Optional callback function to execute
	 * @return void
	 */
	function doSlide(num, callback)
	{
		// Bring to front
		var zmax = 1;
		for (var i = 0; i < slides.length; i++)
		{
			var cur = slides[i].css('zIndex');
			zmax = (cur > zmax) ? cur : zmax;
		}
		slides[num].css('zIndex', zmax + 1);
		
		slides[num].css('top', '-' + opts.height).show();
		slides[num].animate({
			top : 0
		}, opts.transition_speed, callback);
	}
	
	/**
	 * Executes the transition from slide num1 to num2, taking into account the option values.
	 *
	 * @param {int} num1 The slide from which to transition
	 * @param {int} num2 The slide to which to transition
	 * @return void
	 */
	function doRotation(num1, num2)
	{
		// Only attempt rotation if there is more than one slide
		if (slides.length > 1)
		{ 
			setTimeout(function()
			{
				var callback = function()
				{
					showNext(num2);
				};
				
				if (opts.transition == 'fade')
				{
					doFade(num1, num2, callback);
				}
				else if (opts.transition == 'slide')
				{
					doSlide(num2, callback);
				}
			}, opts.delay);
		}
	}
	
	// Initialize the first slide, and start the rotation, shuffling if called for
	if (opts.shuffle)
	{
		shuffle();
	}
	slides[opts.start].show();
	showNext(opts.start);
};