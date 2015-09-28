Ever wanted to have a simple transition object to allow for Slideshow style effects without all the unnecessary overhead of some of the larger modules available?

This jQuery plugin offers a very lightweight, customizable solution, offering both fade and sliding transition types, color customization and sizing options.

Using your existing markup and CSS for the content, this plugin simply sizes and rotates through a list of tagged elements in order to build the slideshow. Here is a quick example:

Example HTML:
```
<div id="my-slideshow">
  <div class="slide"><h1>Slide #1</h1></div>
  <div class="slide"><h1>Slide #2</h1></div>
  <div class="slide"><h1>Slide #3</h1></div>
</div>
```

Example JavaScript:
```
$(document).ready(function()
{
  $('#my-slideshow').gwSlideshow({
    delay            : 2000,    // 2 seconds visibility before transition
    transition       : 'slide', // Valid types: fade or slide
    transition_speed : 1000,    // How fast transition itself takes place
    border           : '1px solid #ffffff',
    bg_color         : '#444444',
    height           : 130,
    width            : 430
  });
});
```

To see the previous code in action, simply [visit this demo](http://code.guahanweb.com/jquery/demos/gwSlideshow.html).

The plugin is now written in full OOP code that allows very easy modification and additional functionality to be added. The slideshow also allows for adding and removing event listeners to specific custom events within the slideshow object itself. These custom events are documented within the full source code as to what parameters will be passed to them. Currently, I have only added the following two events, but they are very easy to add for your individual use, if you care to.

The currently usable events are "beforerotate" and "rotate" which are both executed, as expected, before and immediately following every slide rotation.

In order to attach or remove the event listeners, you will need to access the slideshow object itself, and to allow for easy access, you can simply use jQuery to access the data portion of your slideshow div again. Once we know this, we could easily attach an event listener like so:

```
$('#my-slideshow').data('gwSlideshow').attachListener('rotate', function (prev, curr, show)
{
    alert('Slide rotation completed!');
});
```

On the demo page, I am using the Firebug console to debug the event listeners so you can see them in action. If you open Firebug and reload the page, you will see output as each event is triggered. In addition, there is a timeout call that removes the listeners after 10 seconds - meaning the messages will cease at that time.

Hopefully this newest update will be more usable to most. I have quite a few additions that I still want to add, but if you have suggestions, please feel free to let me know.