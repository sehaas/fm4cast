/*!
 * FM4cast - FM4 chromecase receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013,2014 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

( function( $ ) {


	$.FM4Receiver = function(element) {
		this.tag = (element instanceof $) ? element : $(element);
		this.receiver = null;
		this.remoteMedia = null;
	};


	$.FM4Receiver.prototype = {

		start : function() {

			this.receiver = new cast.receiver.Receiver(
				fm4c.config.apikey, [cast.receiver.RemoteMedia.NAMESPACE], "", 5);

			this.remoteMedia = new cast.receiver.RemoteMedia();
			this.remoteMedia.addChannelFactory(
				this.receiver.createChannelFactory(cast.receiver.RemoteMedia.NAMESPACE));

			$(window).on("load", $.proxy(function() {
				this.remoteMedia.setMediaElement(this.tag.get(0));
			}, this));

			this.receiver.start();
		},
	};
}(jQuery));


( function( $ ) {

	$.TrackService = function(element) {
		this.tag = (element instanceof $) ? element : $(element);
	};

	$.TrackService.prototype = {

		start : function() {
			this._reloadTrackService();
		},

		_reloadTrackService : function() {
			$.ajax({
				"url": "http://hop.orf.at/img-trackservice/fm4.js",
				"dataType": "jsonp",
				"cache": false,
				"jsonp": "callback",
				"jsonpCallback": "renderTracklist",
				"success": $.proxy(this.parseTrackService, this),
			});


			window.setTimeout($.proxy(this._reloadTrackService, this), 30*1000);
		},

		parseTrackService : function(data) {
			$tmp = $("<div></div>");
			$tmp.html(data);
			var ts = [];
			$.each($("li", $tmp), function(lidx, lval) {
				ts[lidx] = {};
				ts[lidx].tracktime = $(".tracktime", lval).text();
				ts[lidx].title =  $(".tracktitle", lval).text();
				ts[lidx].artist = $(".artist", lval).text();
			});

			this.renderTrackService(ts);
		},

		renderTrackService : function(list) {
			this.tag.empty();
			var current = true;
			$.each(list, $.proxy(function(idx, val) {
				if (current) {
					$(document).trigger("currentsong", [ val.artist, val.title ]);
					current = false;
				}
				this.tag.append("<div>{2} &gt; {0} - {1}</div>".format(val.artist, val.title, val.tracktime));
			}, this));
		},
	};


}(jQuery));


// helper function
if (!String.prototype.format) {
	String.prototype.format = String.prototype.f = function() {
		var s = this,
		i = arguments.length;

		while (i--) {
			s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
		}
		return s;
	};
}
