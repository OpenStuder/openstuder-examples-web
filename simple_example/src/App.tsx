import React from 'react';
import refresh from "./refresh.svg";

import {SIAccessLevel, SIConnectionState, SIDeviceMessage, SIGatewayCallback, SIGatewayClient, SIPropertyReadResult, SIStatus, SISubscriptionsResult} from "@marcocrettena/openstuder";

// Retrieve the user's configuration in the package.json file
const config = require('../package.json').config;

class Property {
    constructor(name: string, id: string, unit: string = '') {
        this.name = name;
        this.id = id;
        this.unit = unit;
        this.value = undefined;
    }

    public name: string;
    public id: string;
    public unit: string;
    public value: string | undefined;
}

class AppState {
    public connectionState = SIConnectionState.DISCONNECTED;
    public properties = Array<Property>();
}

class App extends React.Component<{}, AppState> implements SIGatewayCallback {

    private siGatewayClient: SIGatewayClient;

    constructor(props: any) {
        super(props);
        this.state = {
            connectionState: SIConnectionState.DISCONNECTED,
            properties: Array<Property>(),
        };
        for (let deviceConfig of config.properties) {
            this.state.properties.push(new Property(deviceConfig.name, deviceConfig.id, deviceConfig.unit))
        }
        this.siGatewayClient = new SIGatewayClient();
    }

    public componentDidMount() {
        // Set the callback that the SIGatewayClient will call
        this.siGatewayClient.setCallback(this);

        // Try to connect with the server if the configuration owns a host value
        if (config.host !== undefined) {
            this.siGatewayClient.connect(config.host, config.port, config.user, config.password);
        } else {
            // No host value
            throw new Error("No host found, check if \"package.json\" owns a \"config\" object with a \"host\" key");
        }
    }

    public render() {
        switch (this.state.connectionState) {
            case SIConnectionState.DISCONNECTED:
            case SIConnectionState.CONNECTING:
            case SIConnectionState.AUTHORIZING:
                //Display that the client tries to connect
                return (
                    <div className="App">
                        <h1>
                            Connecting...
                        </h1>
                    </div>
                );

            case SIConnectionState.CONNECTED:
                // Display the values and the read button when we are connected
                return (
                    <div className="App">
                        <div className="property-list">
                            {
                                this.state.properties.map(property =>
                                    <div>
                                        <div className="label">{property.name} :</div>
                                        <div className="field">
                                            <div className="value">{property.value || '-'}</div>
                                            <div className="unit">{property.unit}</div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        <button className="read" onClick={this.onReadButtonClicked}><img src={refresh} height="32" alt="read"/></button>
                    </div>
                );
        }
    }

    private onReadButtonClicked = () => {
        // When button is pressed : read all properties
        this.siGatewayClient.readProperties(this.state.properties.map((it) => it.id));
    }

    onConnectionStateChanged(state: SIConnectionState): void {
        this.setState({connectionState: state});
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        const properties = this.state.properties;
        results.filter(result => result.status === SIStatus.SUCCESS).forEach(result => {
            const device = this.state.properties.find(device => device.id === result.id)
            if (device) {
                device.value = result.value.toFixed(3);
            }
        })
        this.setState({properties: properties});
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {}
    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {}
    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void {}
    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {}
    onDescription(status: SIStatus, description: string, id?: string): void {}
    onDeviceMessage(message: SIDeviceMessage): void {}
    onDisconnected(): void {}
    onEnumerated(status: SIStatus, deviceCount: number): void {}
    onError(reason: string): void {}
    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {}
    onPropertySubscribed(status: SIStatus, propertyId: string): void {}
    onPropertiesSubscribed(statuses: SISubscriptionsResult[]) {}
    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {}
    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]) {}
    onPropertyUpdated(propertyId: string, value: any): void {}
    onPropertyWritten(status: SIStatus, propertyId: string): void {}
    onPropertiesFound(status: SIStatus, id: string, count: number, properties: string[]): void {}
}

export default App;
