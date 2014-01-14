/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013,2014 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

;( function( $ ) {

	$.FM4Sender = function() {

	};


	$.FM4Sender.prototype = {



		getOnDemandShows : {
			'4HOPWed': 'House Of Pain',
			'4ULMon': 'Unlimited',
			'4ULTue': 'Unlimited',
			'4ULWed': 'Unlimited',
			'4ULThu': 'Unlimited',
			'4ULFri': 'Unlimited',
			'4SSUSun': 'Sunny Side Up',
			'4CHSat': 'Charts',
			'4ZSSun': 'Zimmerservice',
			'4JZFri': 'Jugend-Zimmer',
			'4DDSat': 'Davi Decks',
			'4ISSun': 'Im Sumpf',
			'4HEMon': 'Heartbeat',
			'4HSTue': 'High Spirits',
			'4TVThe': 'Tribe Vibes',
			'4SHFri': 'Salon Helga',
			'4GLSun': 'Graue Lagune',
			'4PHTue': 'Fivas Ponyhof',
			'4CZWed': 'Chez Hermez',
			'4BTThu': 'Bonustrack',
			'4PXFri': 'Project X',
			'4LBFri': 'La Boum de Luxe',
			'4SSSat': 'Swound Sound System',
			'4LRMon': 'Liquid Radio',
			'4DKMSun': 'Digital Konfusion',
			'4SOPMon': 'Soundpark',
			// '4UTAMon' : "Unter Tannen",
			// '4UTATue' : "Unter Tannen",
			// '4UTAWed' : "Unter Tannen",
			// '4UTAThu' : "Unter Tannen",
			// '4UTAFris' : "Unter Tannen",
			// '4DZWed' : Doppelzimmer,
		},

		getPodcasts : [
			"http://static.orf.at/podcast/fm4/fm4_interview_podcast.xml",
			"http://static.orf.at/podcast/fm4/fm4_reality_check_podcast.xml",
			"http://static.orf.at/podcast/fm4/fm4_musikerziehung.xml",
			"http://static.orf.at/podcast/fm4/fm4_ombudsmann.xml",
			"http://static.orf.at/podcast/fm4/fm4_science_busters.xml",
			"http://static.orf.at/podcast/fm4/FM4_Mit_Akzent.xml",
			"http://static.orf.at/podcast/fm4/FM4_Johanna_gefaellt_das_nicht.xml",
			"http://static.orf.at/podcast/fm4/fm4_projekt_x.xml",
			"http://static.orf.at/podcast/fm4/fm4_chez_hermes_extrawurscht.xml",
			//"http://static.orf.at/fm4/podcast/soundpark.xml",
			//"http://static.orf.at/fm4/podcast/fm4_comedy.xml",
		],

		getPocastInfo : function(podcast) {
			var url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=" + podcast;
			$.ajax({
				url : url,
				dataType : 'jsonp',
				cache : false,
				success : $.proxy(this._onPodcastInfo, this)
			});
		},

		_onPodcastInfo : function(response) {
			console.log(response.responseData.feed.entries.length);
		},

		getOnDemandInfo : function( key ) {
			var showurl = 'http://audioapi.orf.at/fm4/json/2.0/playlist/' + key;
			$.ajax({
				url : showurl,
				dataType : 'jsonp',
				cache : false,
				success : $.proxy(this._onDemandInfo, this)
			});
		},

		_onDemandInfo : function( response ) {
			console.log('http://loopstream01.apa.at/?channel=fm4&ua=flash&id=' + response.data.streams[0].loopStreamId);
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