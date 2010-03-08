/**
 * @fileoverview
 * This project is a Slideshow plugin for the jQuery JavaScript library. It is intended to offer
 * a lightweight module to transform existing HTML content into animated slides for easy display
 * on your website. If there are any questions, comments or suggestions concerning this project,
 * please feel free to contact me at garth [at] guahanweb [dot] com.
 *
 * @author Garth Henson (Guahan Web)
 * @version 0.2
 */
(function($) {
	var gwSlideshow = function (element, options)
	{
		element = $(element);
		var self = this;

		/**
		 * Initialization of the slideshow object. Here is where the settings are saved and all elements
		 * are parsed and manipulated as necessary
		 *
		 * @return void
		 */
		self.init = function (options)
		{
			self.settings = $.extend({
				width  : '300px',
				height : '80px',
				border : '1px solid #000000',
				bg_color : '#ffffff',
				delay : 5000,
				transition : 'fade',
				transition_speed : 500,
				start : 0,
				shuffle : false
			}, options || {});

			// Setup listeners
			self.listeners = {};
			if (options.listeners || false)
			{
				for (var k in options.listeners)
				{
					self.addListener(k, options.listeners[k]);
				}
			}

			self.setupContainer();
			self.setupSlides();

			// Setup some of the member variables we will need
			self.current_index = self.settings.start;
			self.timeout_id = null;

			// Initialize the first slide, and start the rotation, shuffling if called for
			if (self.settings.shuffle)
			{
				self.shuffle();
			}
			self.slides[self.settings.start].show();
			self.play();
			self.triggerEvent('load');
		};

		/**
		 * Set up the styles for the container
		 *
		 * @return void
		 */
		self.setupContainer = function ()
		{
			element.css({
				width  : self.settings.width,
				height : self.settings.height,
				border : self.settings.border,
				backgroundColor : self.settings.bg_color,
				position : 'relative',
				overflow : 'hidden'
			});

			if (self.settings.float || false)
			{
				element.css('float', self.settings.float);
			}
		};

		/**
		 * Find and position all slides for the show
		 *
		 * @return void
		 */
		self.setupSlides = function ()
		{
			self.slides = [];
			element.children('div').each(function()
			{
				if ($(this).hasClass('slide'))
				{
					var s = $(this).css({
						width  : self.settings.width,
						height : self.settings.height,
						backgroundColor : self.settings.bg_color,
						position : 'absolute',
						top  : 0,
						left : 0,
						overflow : 'hidden',
						zIndex : 1
					}).hide();
			
					self.slides.push(s);
				}
			});
		};

		/**
		 * Sets the slideshow to a playing state and sets up the next transition
		 *
		 * @return void
		 */
		self.play = function (callback)
		{
			// Be sure we're not already playing
			if (!self.is_playing)
			{
				self.triggerEvent('beforeplay');
	
				self.timeout_id = setTimeout(function ()
				{
					self.showNext(true);
				}, self.settings.delay);
				self.is_playing = true;
			}
	
			if (callback || false)
			{
				callback();
			}
		};

		/**
		 * Cancels any current timeout for transitions and sets the slideshow to a stopped state
		 *
		 * @return void
		 */
		self.stop = function (callback)
		{
			// Be sure we're already playing
			if (self.is_playing)
			{
				self.triggerEvent('beforestop');
				clearTimeout(self.timeout_id);
				self.is_playing = false;
			}

			if (callback || false)
			{
				callback();
			}
		};

		/**
		 * Shuffle the slide array
		 *
		 * @return void
		 */
		self.shuffle = function ()
		{
			var o = self.slides;
			for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			self.slides = o;
		};

		/**
		 * Shows the next (+1) slide in the array
		 *
		 * @param {bool} internal Whether or not this was called internally (defaults to false)
		 * @return void
		 */
		self.showNext = function (internal)
		{
			var next = self.current_index + 1;
			if (next == self.slides.length)
			{
				next = 0;
			}
			
			self.showSlide(next, internal);
		};
	
		/**
		 * Shows the previous (-1) slide in the array
		 *
		 * @param {bool} internal Whether or not this was called internally (defaults to false)
		 * @return void
		 */
		self.showPrev = function (internal)
		{
			var next = self.current_index - 1;
			if (next < 0)
			{
				next = self.slides.length - 1;
			}
			
			self.showSlide(next, internal);
		};

		/**
		 * Request to show a specific slide
		 *
		 * @param {int} num The index of the slide to show
		 * @param {bool} internal Whether or not this was called internally (defaults to false)
		 * @return void
		 */
		self.showSlide = function (num, internal)
		{
			// Resolve external calls
			if (!(internal || false))
			{
				self.stop();
			}

			// Only transition if we are not currently in transition
			if (!self.in_transition)
			{
				if (num < self.slides.length && num != self.current_index)
				{
					// We know it's a valid request, so execute it!
					self.doRotation(self.slides.current_index, num);
					self.current_index = num;
				}
			}
		};
	
		/**
		 * Fades from slide num1 to num2 and performs provided callback upon completion
		 *
		 * @param {int} num1 The slide to fade out
		 * @param {int} num2 The slide to fade in
		 * @param {function} callback Optional callback function to execute
		 * @return void
		 */
		self.doFade = function (num1, num2, callback)
		{
			self.slides[num1].fadeOut('slow');
			self.slides[num2].fadeIn('slow', callback);
		};
	
		/**
		 * Slides slide num2 over the currently visible slide
		 *
		 * @param {int} num The slide to display
		 * @param {function} callback Optional callback function to execute
		 * @return void
		 */
		self.doSlide = function (num, callback)
		{
			// Bring to front
			var zmax = 1;
			for (var i = 0; i < self.slides.length; i++)
			{
				var cur = self.slides[i].css('zIndex');
				zmax = (cur > zmax) ? cur : zmax;
			}
			self.slides[num].css('zIndex', zmax + 1);
			
			self.slides[num].css('top', '-' + self.settings.height).show();
			self.slides[num].animate({
				top : 0
			}, self.settings.transition_speed, callback);
		};
		
		/**
		 * Executes the transition from slide num1 to num2, taking into account the option values.
		 *
		 * @param {int} num1 The slide from which to transition
		 * @param {int} num2 The slide to which to transition
		 * @return void
		 */
		self.doRotation = function (num1, num2)
		{
			// Only attempt rotation if there is more than one slide
			if (self.slides.length > 1)
			{ 
				self.triggerEvent('beforerotate', {prev_slide : num1, curr_slide : num2});

				// Begin transation
				self.in_transition = true;

				var callback = function()
				{
					// Transition is complete
					self.in_transition = false;

					// We only want to set the new transition if we're still playing
					if (self.is_playing)
					{
						self.timeout_id = setTimeout(function ()
						{
							self.showNext(true);
						}, self.settings.delay);
					}
				};
					
				if (self.settings.transition == 'fade')
				{
					self.doFade(num1, num2, function ()
					{
						callback();
						self.triggerEvent('rotate', {prev_slide : num1, curr_slide : num2});
					});
				}
				else if (self.settings.transition == 'slide')
				{
					self.doSlide(num2, function ()
					{
						callback();
						self.triggerEvent('rotate', {prev_slide : num1, curr_slide : num2});
					});
				}
			}
		};

		/**
		 * Add a listener to an internal event
		 *
		 * @param {String} type The name of the event to target
		 * @param {function} callback The function to execute
		 * @return void
		 */
		self.addListener = function (type, callback)
		{
			// First, add empty array to listener object if it isn't there
			if (!self.listeners[type] || true)
			{
				self.listeners[type] = [];
			}

			// Push the listener onto the stack
			self.listeners[type].push(callback);
		};

		/**
		 * Remove a listener from the internal event
		 *
		 * @param {String} type The name of the event to target
		 * @param {function} callback The function to remove
		 * @return void
		 */
		self.removeListener = function (type, callback)
		{
			if ((self.listeners[type] || false) && self.listeners[type].length > 0)
			{
				var temp = [];
				for (var i = 0; i < self.listeners[type].length; i++)
				{
					if (self.listeners[type][i] != callback)
					{
						alert(callback + "\n\n NOT EQUAL TO \n\n" + self.listeners[type][0]);
						temp.push(self.listeners[type][i]);
					}
				}
				self.listeners[type] = temp;
			}
		};

		/**
		 * Execute the given event, executing all listeners
		 *
		 * @param {String} type The name of the event to trigger
		 * @return void
		 */
		self.triggerEvent = function (type, params)
		{
			if ((self.listeners[type] || false) && self.listeners[type].length > 0)
			{
				// Handle only valid events
				switch (type)
				{
					case 'beforerotate':
						// Called with 3 params: <prev_slide>, <curr_slide>, <slideshow>
						for (var i = 0; i < self.listeners[type].length; i++)
						{
							self.listeners[type][i](params.prev_slide, params.curr_slide, self);
						}
						break;
	
					case 'rotate':
						// Called with 3 params: <prev_slide>, <curr_slide>, <slideshow>
						for (var i = 0; i < self.listeners[type].length; i++)
						{
							self.listeners[type][i](params.prev_slide, params.curr_slide, self);
						}
						break;

					default:
						for (var i = 0; i < self.listeners[type].length; i++)
						{
							self.listeners[type][i](self);
						}
				}
			}
		};
	
		self.init(options);
	};

	// Let's actually declare the plugin now that we have our object 
	$.fn.gwSlideshow = function(options)
	{
		return this.each(function ()
		{
			var element = $(this);

			// Return early if this element already has a plugin instance
			if (element.data('gwSlideshow')) return;

			var slideshow = new gwSlideshow(this, options);

			// Store plugin object in this element's data
			element.data('gwSlideshow', slideshow);
		});
	};
})(jQuery);
