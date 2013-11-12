/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

( function( $ ) {

	$.LastFMArtwork = function(element) {
		this.tag = (element instanceof $) ? element : $(element);
	};

	$.LastFMArtwork.prototype = {

		start : function() {
			$(document).on("currentsong", $.proxy(this.fetchArtwork, this));
		},

		fetchArtwork : function(event, artist, track) {
			var url = "http://ws.audioscrobbler.com/2.0/";

			$.ajax({
				"url" : url,
				"dataType" : "jsonp",
				"data" : {
					"method" : "artist.getinfo",
					"format" : "json",
					"api_key" : fm4c.config.lastfm_apikey,
					"autocorrect" : 1,
					"artist" : artist,
				},
				"success" : $.proxy(this.renderArtwork, this),
			});
		},

		renderArtwork : function(data) {
			if (!data && data.artist === "undefined") {
				console.log("Could not load artwork [{0}]: {1}".format(data.error, data.message));
				return;
			}

			if (data.artist && data.artist.image) {
				var artwork = $.grep(data.artist.image, function(val, idx) {
					return val.size === "extralarge";
				})[0];
				if (artwork) {
					this.tag.css("background-image", "url('{0}')".format(artwork["#text"]));
				}
			}
		},

	};

}(jQuery));