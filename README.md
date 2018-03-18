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
Using the link above, it will synchronize to a php / DB server hosted by 1&1 (Germany).

<img src="http://tazrabbaz.com/Scrub2/Media/ScreenshotScrub2_Cards.png"
alt="Screenshot of card list" width="400"/>

By sharing the synchronization credentials a multi-user and a multi-device workflow
is possible.

### Prerequisites

In order to run the php and DB on your own server, you have to install php and Mysql.

You can run the app on your local drive without a server.

### Installing

If you just want to run the app local without synchronization, copy the .htm, .css and .js
into a folder and click Scrub2.htm.

## Deployment

In order to setup a synchronization server, you have to:

1. Create a database and a user on the Mysql-server, for example by using phpmyadmin.
1. Fill out the mysql_credentials_template.php and rename it to mysql_credentials.php
1. Copy the complete repository onto the server.
1. Initialize the database by calling  `http://yourserver.org/some/folder/Scrub2/php/init_database.php` in a browser.
1. On success, remove init_database.php.
1. Call `http://yourserver.org/some/folder/Scrub2/Scrub2.htm` in your browser.

## Built With

* [Automerge.js](https://github.com/automerge/automerge) - The local data handler, needed for synchronization.
* [BlazeUI](https://www.blazeui.com/) - Nice and lightweight user interface components.
* [anime.js](http://animejs.com/) - Could not resist...
* [Google charts](https://developers.google.com/chart/) - Very nice and clean.
* [Google material design icons](https://material.io/icons/) - Very nice and clean.
* [lz-string compression](http://pieroxy.net/blog/pages/lz-string/index.html) - Programmer friendly and set up in 3 minutes

## Feedback

Use test/test/test for synchronization credentials in the app above and add your ideas.

## Future and differences to Scrub

I actually used Scrub 1 until know and I like it, but the constant connection that is 
required by the websocket is problematic. In addition, the auto-addition of points
in conjunction with some heavy animation was difficult to use (read: brutal on cpu).
Thus, animation in Scrub2 is turned off by default.

I still like the synchronous actions from webssocket commands, but it is really not
necessary. Merging and commmitting on demand is a lot better.

Regarding the future, some TLS, local AES encryption of data before sending it to the
server and a hash based token based on the original access token would be nice.

## Authors

* **dasmuli** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* See *Build With* for impressive some libraries

