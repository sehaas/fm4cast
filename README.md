# FM4 chromecast sender/receiver #

This Chrome app allows you to stream FM4 media (live stream, on-demand shows & podcasts) to your chromecast.


## Setup ##

- Copy the files to your websever
- [get an app-key](https://developers.google.com/cast/whitelisting#whitelist-receiver) for your receiver url at 
- Unlock your chromecast for your app-key.
- Whitelist your domain in the Chrome extension.

- Get a [last.fm api-key](http://www.last.fm/api) to display media artwork.

- Create a file `js/apikey.js` and set your keys.


## About the app ##

It's not finished yet. You can see here what is working and what not.

### Working ###

* [sender] start app on selected chromecast
* [sender] reconnect on page reload
* [sender] fetch media information form FM4
	* live stream
	* on demand shows (I'm not sure if I got everything)
	* podcasts
* [sender] seek position (shows and podcast only)
* [sender] display information of current media (if available)
* [sender] pause/resume
* [receiver] play selected media
* [receiver] fetch trackservice
* [receiver] fetch artwork of current song

### NOT Working ###

* [sender] clean layout
	* select chromecast
	* player
	* playlist
* [sender] cache playlist (fetch only every 3h)
* [receiver] display trackservice only while playing live stream
* [receiver] display information for on demand shows or podcast

