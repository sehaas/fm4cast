# FM4 chromecast sender/receiver #

This Chrome app allows you to stream FM4 media to your chromecast.

**Update [04.11.2018]**
Published first public accessible version.

**Update [02.11.2018]**
Tabula rasa - Rewriting the code for the CAF Receiver.

## How to use the app ##
Just open https://fm4cast.deebas.com with Chrome and select your casting device.

## What's working ##

- Playback of the livestream
- Similar UI as the official [Radio FM4 online player](https://fm4.orf.at/player/live)
- Timeline rendering
	* Past, current and scheduled tracks
	* Supported types: Music, News, live sessions(?)
	* Timeline scrolling
- Show information
- Album artwork

- Tested devices
	* Chromcast (v1)
	* Chromcast Audio
	* Google Home Mini

## Contributing ##
Please feel free to submit feedback, [bug reports](https://github.com/sehaas/fm4cast/issues/new) or [pull requests](https://github.com/sehaas/fm4cast/compare)

### ToDo ###
- Improve reloading of tracklist/timeline data
- Support more types of BroadcastItem
- Cleanup CSS / DOM
- Cleanup JS / d3 rendering code

## Content ##
The current versions of the FM4 webpage and Android/iOS apps do not support casting.
This webpace/receiver only uses the public available content to fill this gap.

## License ##
Copyright 2013,2018 Sebastian Haas (sehaas@deebas.com)

Released under the MIT license

@RadioFM4, feel free to use some of this code and make it an official feature.
