function getNiceFormatName(format) {
	switch (format) {
	case "aac":
		return "AAC";
	case "mp3":
		return "MP3";
	case "aacp":
		return "AAC Plus";
	default:
		return format;
	}
}

function onChannelsXMLReceived(response) {
	try {

		var doc = new QDomDocument();
		doc.setContent(response);

		var xmlchannels = doc.elementsByTagName("channel");
		var channelsLength = xmlchannels.length();

		if (response.length == 0 || channelsLength == 0) {
			Amarok.Window.Statusbar
					.longMessage("<b>SomaFM</b><br/><br/>Download of channels <font color=red><b>failed</b></font>. Please check your internet connection.");
			throw "Download of channels failed";
		}

		Amarok.debug("got " + channelsLength + " channels");

		channels = new Object;

		for (i = 0; i < channelsLength; i++) {

			var channel = xmlchannels.item(i);

			var id = channel.toElement().attribute("id");
			Amarok.debug("parse station: " + id);

			var description = channel.toElement().firstChildElement(
					"description").text();

			var title = channel.toElement().firstChildElement("title").text();

			var coverurl = channel.toElement().firstChildElement("image")
					.text();

			channels[id] = new Station(title + " – " + description, "what",
					coverurl);

			var higheststreams = channel.toElement().elementsByTagName(
					"highestpls");
			Amarok.debug("station " + id + " got " + higheststreams.length()
					+ " higheststreams");

			var faststreams = channel.toElement().elementsByTagName("fastpls");
			Amarok.debug("station " + id + " got " + faststreams.length()
					+ " faststreams");

			var slowstreams = channel.toElement().elementsByTagName("slowpls");
			Amarok.debug("station " + id + " got " + slowstreams.length()
					+ " slowstreams");

			var streams = new Array;

			for (j = 0; j < higheststreams.length(); j++) {
				var stream = higheststreams.item(j);

				var name = "HQ: "
						+ getNiceFormatName(stream.toElement().attribute(
								"format"));
				var url = stream.toElement().text();

				streams.push(new Stream(name, url));
			}

			for (j = 0; j < faststreams.length(); j++) {
				var stream = faststreams.item(j);

				var name = "MQ: "
						+ getNiceFormatName(stream.toElement().attribute(
								"format"));
				var url = stream.toElement().text();

				streams.push(new Stream(name, url));
			}
			for (j = 0; j < slowstreams.length(); j++) {
				var stream = slowstreams.item(j);

				var name = "LQ: "
						+ getNiceFormatName(stream.toElement().attribute(
								"format"));
				var url = stream.toElement().text();

				streams.push(new Stream(name, url));
			}

			for (j = 0; j < streams.length; j++) {
				channels[id].streams.push(streams[j]);
			}

		}

		populateChannels();
	} catch (err) {
		Amarok.debug("Caught error in function onChannelsXMLReceived: " + err);
	}
}
