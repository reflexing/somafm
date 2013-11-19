/**************************************************************************
*   Unofficial Amarok script for listening to SomaFM channels.            *
*   Channels list is downloaded from publicly available XML file.        *
*                                                                         *
*   Copyright                                                             *
*   (C) 2013 Kirill Churin <reflexing@reflexing.ru>                       *
*                                                                         *
*   This program is free software; you can redistribute it and/or modify  *
*   it under the terms of the GNU General Public License as published by  *
*   the Free Software Foundation; either version 2 of the License, or     *
*   (at your option) any later version.                                   *
*                                                                         *
*   This program is distributed in the hope that it will be useful,       *
*   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
*   GNU General Public License for more details.                          *
*                                                                         *
*   You should have received a copy of the GNU General Public License     *
*   along with this program; if not, write to the                         *
*   Free Software Foundation, Inc.,                                       *
*   51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.         *
**************************************************************************/

Importer.loadQtBinding("qt.core"); // for QUrl
Importer.loadQtBinding("qt.gui"); // for QPixmap
Importer.loadQtBinding("qt.xml"); // for QDomDocument

Importer.include("parsexml.js");

var channelsXMLURL = "http://somafm.com/channels.xml";
var channels = null;

function Station(name, url, logo) {
	this.name = name;
	this.url = url;
	this.logo = logo;
	this.streams = new Array;
}

function Stream(name, url) {
	this.name = name;
	this.url = url;
}

function SomaFM() {
	Amarok.debug("Creating SomaFM service ...");
	ScriptableServiceScript
			.call(
					this,
					"SomaFM",
					2,
					"Listener-supported, commercial-free, underground/alternative radio.",
					"SomaFM. 14 unique channels of listener-supported, commercial-free, underground/alternative radio broadcasting from San Francisco.",
					false);
	Amarok.debug("ok.");
}

// Populate SomaFM channels (level 1)
function populateChannels() {
	Amarok.debug("populateChannels()");

	for (channel in channels) {

		item = Amarok.StreamItem;
		item.level = 1;
		item.callbackData = channel;
		item.itemName = channels[channel].name;
		item.coverUrl = channels[channel].logo;
		script.insertItem(item);
	}

	script.donePopulating();
}

// Populate streams (level 0)
function populateStreams(callbackData) {
	Amarok.debug("populateStreams()");

	for (i = 0; i < channels[callbackData].streams.length; i++) {
		var stream = channels[callbackData].streams[i];

		var item = Amarok.StreamItem;
		item.level = 0;
		item.callbackData = null;
		item.itemName = stream.name;
		item.playableUrl = stream.url;
		script.insertItem(item);
	}

	script.donePopulating();
}

/* Fill tree view in Amarok */
function onPopulating(level, callbackData, filter) {
	Amarok.debug("onPopulating(level = " + level + ", callbackData = "
			+ callbackData + ", filter = " + filter + ")");

	if (level == 1) { // the top level SomaFM radio channels
		Amarok.debug("Populating channels (level 1)...");

		Amarok.debug("channels == null, downloading channels...");

		try {
			new Downloader(new QUrl(channelsXMLURL), onChannelsXMLReceived);
		} catch (err) {
			Amarok.debug(err);
		}

		// populateChannels();
		// No populateChannels(); here, as the downloader returns
		// immediately, even before the parser is being run.
		// Instead call it at then end of onChannelsXMLReceived(...).

		Amarok.debug("Done populating channels (level 1)");

	} else if (level == 0) { // the streams for each radio channel
		Amarok.debug("Populating streams (level 0)...");

		populateStreams(callbackData);

		Amarok.debug("Done populating streams (level 0)");
	}
}

function onCustomize() {
	var iconPath = Amarok.Info.scriptPath() + "/icon.png";

	Amarok.debug("loading icon: " + iconPath);
	script.setIcon(new QPixmap(iconPath));

	Amarok.debug("on customize: OK");
}

script = new SomaFM();
script.populate.connect(onPopulating);
script.customize.connect(onCustomize);