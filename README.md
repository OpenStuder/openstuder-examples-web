# Typescript examples for OpenStuder client

The examples have been tested on **Windows 10**.

## Requirements

### Git

You need **git** to clone the projects to your local machine.

	# https://git-scm.com/download/win

### Node.js

The examples can be used by the JavaScript runtime **Node.js**.

	# https://nodejs.org/
	
## simple-example

This example consists on clicking a button to read some properties of the Studer gateway. Starting with this example should permit the understanding of the OpenStuder Web Client.
You will need to edit the `package.json` file at the root of the project, it contains the values of the `host`, `port`, `user` and `password`  in the `config` object. Additionally 
you can configure the properties that are displayed on the page by modifying the `properties` array in `config`.

All the code is in the file **simple_example/src/App.tsx**, to run the example do:

	# git clone https://github.com/OpenStuder/openstuder-examples-web.git
	# cd openstuder-examples-web/simple_example
	# npm install
	# npm start

## medium-example

This application subscribes to some properties, these properties are added together and plot into a chart.

All the code is in the file **medium_example/src/App.tsx**, to run the example do:

	# git clone https://github.com/OpenStuder/openstuder-examples-web.git
	# cd openstuder-examples-web/medium_example
	# npm install
	# npm start
	
## Difficult example - WebUI

WebUI to connect to a openstuder gateway including a dashboard, datalog display, messages list and property editor.

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
