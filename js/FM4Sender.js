/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

( function( $ ) {

	$.FM4Sender = function(element) {
		$.FM4Sender.tag = (element instanceof $) ? element : $(element);
	};

	$.FM4Sender.castApi = null;
	$.FM4Sender.receiverMap = {};

	$.FM4Sender.prototype = {
		init : function() {
			if (window.cast && window.cast.isAvailable) {
				// Already initialized
				initializeCastApi();
			} else {
				// Wait for API to post a message to us
				$(window).on("message", function(event) {
					if (event.source == window && event.data && event.data.source == "CastApi" && event.data.event == "Hello"){
						initializeCastApi();
					}
				});
			}
		},

		initializeCastApi : function() {
			$.FM4Sender.castApi = castApi = new cast.Api();
			castApi.addReceiverListener(fm4c.config.apikey, onReceiverList);
		},

		onReceiverList : function(list) {
			$.FM4Sender.receiverMap = {};
			var tag = $.FM4Sender.tag;

			$.each(list, function(idx, val) {
				$.FM4Sender.receiverMap[val.id] = val;
				tag.append("<div id='cast_{1}' data-castid='{1}'>{0}</div>".format(val.name, val.id));
			});
			$("div", tag).on("click", onReceiverSelected);
		},

		onReceiverSelected : function() {
			var $this = $(this);
			var castId = $this.data("castid");
			var receiver = $.FM4Sender.receiverMap[castId];
			var launchRequest = new cast.LaunchRequest(fm4c.config.apikey, receiver);
			launchRequest.parameters = '';

			var loadRequest = new cast.MediaLoadRequest("http://mp3stream1.apasf.apa.at:8000/;");
			loadRequest.autoplay = true;

			$.FM4Sender.castApi.launch(launchRequest, function(status) {
				if (status.status == 'running') {
					currentActivityId = status.activityId;
					$.FM4Sender.castApi.loadMedia(currentActivityId, loadRequest, launchCallback);
				} else {
					console.log('Launch failed: ' + status.errorString);
				}
			});
		},

		launchCallback : function(status) {
			// noop
		},

	};

}(jQuery));


// helper function
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};