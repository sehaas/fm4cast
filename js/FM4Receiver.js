/*!
 * FM4cast - FM4 chromecase receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013 Sebastian Haas (sehaas@deebas.com)
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
			remoteMedia.addChannelFactory(
				this.receiver.createChannelFactory(cast.receiver.RemoteMedia.NAMESPACE));

			$(window).on("load", $.proxy(function() {
				this.remoteMedia.setMediaElement(this.tag.get(0));
			}, this));

			this.receiver.start();
		},
	};
}(jQuery));