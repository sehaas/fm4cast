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
		$.FM4Receiver.tag = (element instanceof $) ? element : $(element);
	};

	$.FM4Receiver.receiver = null;
	$.FM4Receiver.remoteMedia = null;

	$.FM4Receiver.prototype = {

		start : function() {

			var receiver = $.FM4Receiver.receiver = new cast.receiver.Receiver(
				fm4c.config.apikey, [cast.receiver.RemoteMedia.NAMESPACE], "", 5);

			var remoteMedia = $.FM4Receiver.remoteMedia = new cast.receiver.RemoteMedia();
			remoteMedia.addChannelFactory(
				receiver.createChannelFactory(cast.receiver.RemoteMedia.NAMESPACE));

			$(window).on("load", function() {
				remoteMedia.setMediaElement($.FM4Receiver.tag.get(0));
			});

			receiver.start();
		},
	};
}(jQuery));