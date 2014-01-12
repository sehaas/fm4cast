/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013,2014 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

( function( $ ) {

	$.FM4Sender = function(element, statusElem) {
		this.tag = (element instanceof $) ? element : $(element);
		this.statusTag = (statusElem instanceof $) ? statusElem : $(statusElem);
		this.castApi = null;
		this.receiverMap = {};
	};


	$.FM4Sender.prototype = {
		init : function() {
			if (window.cast && window.cast.isAvailable) {
				// Already initialized
				this.initializeCastApi();
			} else {
				// Wait for API to post a message to us
				window.addEventListener("message", $.proxy(function(event) {
					if (event.source == window && event.data && event.data.source == "CastApi" && event.data.event == "Hello"){
						this.initializeCastApi();
					}
				}, this));
			}
		},

		initializeCastApi : function() {
			this.initApiKeys($.proxy(function() {
				this.castApi = new cast.Api();
				this.castApi.addReceiverListener(fm4c.config.apikey, $.proxy(this.onReceiverList, this));
			}, this));
		},

		initApiKeys : function(success) {
			if (window.fm4c && fm4c.config && fm4c.config.apikey) {
				success();
			} else {
				$.getScript("/apikey.js").done(function(){
					success();
				})
				.fail(function() {
					console.log("could not load apikey.js");
				});
			}
		},

		onReceiverList : function(list) {
			this.receiverMap = {};

			this.tag.empty();
			$.each(list, $.proxy(function(idx, val) {
				this.receiverMap[val.id] = val;
				this.tag.append("<div id='cast_{1}' data-castid='{1}'>{0}</div>".format(val.name, val.id));
			}, this));
			$("div", this.tag).on("click", $.proxy(this.onReceiverSelected, null, this));
		},

		onReceiverSelected : function(that) {
			var $this = $(this);
			var castId = $this.data("castid");
			var receiver = that.receiverMap[castId];
			var launchRequest = new cast.LaunchRequest(fm4c.config.apikey, receiver);
			launchRequest.parameters = '';

			var loadRequest = new cast.MediaLoadRequest("http://mp3stream1.apasf.apa.at:8000/;");
			loadRequest.autoplay = true;
			loadRequest.title = "Radio FM4";

			that.castApi.launch(launchRequest, $.proxy(function(status) {
				if (status.status == 'running') {
					this.currentActivityId = status.activityId;
					this.castApi.loadMedia(this.currentActivityId, loadRequest, $.proxy(this.launchCallback, this));
				} else {
					console.log('Launch failed: ' + status.errorString);
				}
			}, that));
		},

		launchCallback : function(status) {
			// still a dummy status
			this.statusTag.text("playing");
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