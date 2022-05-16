# Typescript examples for openstuder client

The examples have been tested on **Windows 10**, **macOS 11** and **Ubuntu Linux 20.04**.

## Requirements

### Git

You need **git** to clone the projects to your local machine.

	# https://git-scm.com/download

### Node.js

The package manager of **Node.js**, **npm** is used to resolve the dependencies and build and run the application.

	# https://nodejs.org/
	
## Minimal example - read_properties

This example offers a button to read some properties from an openstuder gateway. 

Starting with this example simplifies the understanding of the basic functionality of the openstuder WebSocket client.
You will need to edit the `package.json` file at the root of the project, it contains the configuration values `host`, `port`, `user` and `password` inside the `config` object. 
Additionally you can configure the properties that are displayed on the page by modifying the `properties` array in `config`.

To run the example do:

	# git clone https://github.com/OpenStuder/openstuder-examples-web.git
	# cd openstuder-examples-web/read_properties
	# npm install
	# npm start

## Intermediate example - subscribe

This application subscribes to properties in order to get notified about new values, these properties are processed and a realtime plot is displayed.

To run the example do:

	# git clone https://github.com/OpenStuder/openstuder-examples-web.git
	# cd openstuder-examples-web/subscribe
	# npm install
	# npm start

## Bluetooth example - read_properties_bt

This example offers a button to read some properties from an openstuder gateway vi Bluetooth.

Starting with this example simplifies the understanding of the basic functionality of the openstuder Bluetooth client.
You will need to edit the `package.json` file at the root of the project, it contains the configuration values `user` and `password` inside the `config` object.
Additionally, you can configure the properties that are displayed on the page by modifying the `properties` array in `config`.

To run the example do:

	# git clone https://github.com/OpenStuder/openstuder-examples-web.git
	# cd openstuder-examples-web/read_properties_bt
	# npm install
	# npm start

## Difficult example - WebUI

WebUI to connect to a openstuder gateway including a dashboard, datalog display, messages list and property editor. 

This is a complete example and shows most of the functionality of the client.

To run the example do:

	# git clone https://github.com/OpenStuder/openstuder-examples-web.git --recursive
	# cd openstuder-examples-web/webui
	# npm install
	# npm start
	
The application tries to connect to localhost, should you need to connect to another host, you need to modify the file **src/index.tsx**:

	ReactDOM.render(
		<React.StrictMode>
		<App host="CUSTOM_HOST"/>
		</React.StrictMode>,
		document.getElementById('root')
	);
