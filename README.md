# Scrub 2

Scrub2 is a planing app for Scrum like development.
Cards show features to be implemented or bugs that should be removed.
The priority of a card is indicated by the position in a list,
the higher the card is the more important it is.
By finishing a card it is moved to the finished card list and the time of finishing is logged.
Using this data, a chart is drawn showing the project progress over time.

<img src="http://tazrabbaz.com/Scrub2/Media/ScreenshotScrub2_Chart.png"
alt="An example of a chart." width="400"/>

## Getting Started

The app can be found [here](http://tazrabbaz.com/Scrub2/Scrub2.htm).

The app should work without further installation.

<img src="http://tazrabbaz.com/Scrub2/Media/ScreenshotScrub2_Cards.png"
alt="Screenshot of card list" width="400"/>

### Prerequisites

The app runs in the browser, Chrome and Firefox are supported.

### Installing

If you just want to run the app locally, copy the .htm, .css and .js
into a folder and click Scrub2.htm.

## Built With

* [Automerge.js](https://github.com/automerge/automerge) - The local data handler, needed for synchronization.
* [BlazeUI](https://www.blazeui.com/) - Nice and lightweight user interface components.
* [anime.js](http://animejs.com/) - Could not resist...
* [Google charts](https://developers.google.com/chart/) - Very nice and clean.
* [Google material design icons](https://material.io/icons/) - Very nice and clean.
* [lz-string compression](http://pieroxy.net/blog/pages/lz-string/index.html) - Programmer friendly and set up in 3 minutes

## Future and differences to Scrub

I actually used Scrub 1 until know and I like it, but the constant connection that is 
required by the websocket is problematic. In addition, the auto-addition of points
in conjunction with some heavy animation was difficult to use (read: brutal on the CPU).
Thus, animation in Scrub2 is turned off by default.

I still like the synchronous actions from webssocket commands, but it is really not
necessary. Merging and commmitting on demand is a lot better.

I removed the php server synchronisation and changed to file based work. This allows backups
and sharing with others. Much simpler and more control for the user. Althouth I startet some p2p code,
very interesting, too.

## Authors

* **dasmuli** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* See *Build With* for impressive some libraries

