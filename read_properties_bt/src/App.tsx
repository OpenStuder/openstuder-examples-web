import React from 'react';
import refresh from "./refresh.svg";

import {
    SIAccessLevel,
    SIBluetoothGatewayClient,
    SIBluetoothGatewayClientCallbacks,
    SIConnectionState,
    SIDataLogEntry,
    SIDeviceMessage,
    SIExtensionStatus,
    SIStatus
} from "@openstuder/openstuder";

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

class App extends React.Component<{}, AppState> implements SIBluetoothGatewayClientCallbacks {

    private client: SIBluetoothGatewayClient;

    constructor(props: any) {
        super(props);
        this.state = {
            connectionState: SIConnectionState.DISCONNECTED,
            properties: Array<Property>(),
        };
        for (let deviceConfig of config.properties) {
            this.state.properties.push(new Property(deviceConfig.name, deviceConfig.id, deviceConfig.unit))
        }
        this.client = new SIBluetoothGatewayClient();
    }

    public componentDidMount() {
        // Set the callback that the SIGatewayClient will call
        this.client.setCallback(this);
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
                            <button onClick={this.onConnectButtonClicked} disabled={this.state.connectionState !== SIConnectionState.DISCONNECTED}>Connect...</button>
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
                        <button onClick={this.client.disconnect}>Disconnect</button>
                    </div>
                );
        }
    }

    private onConnectButtonClicked = (event: any) => {
        this.client.connect(config.user, config.password);
    }

    private onReadButtonClicked = () => {
        // When button is pressed : read all properties
        this.state.properties.forEach((property: Property) => this.client.readProperty(property.id));
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        this.setState({connectionState: SIConnectionState.CONNECTED});
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: any): void {
        if (status === SIStatus.SUCCESS) {
            const properties = this.state.properties;
            const device = properties.find(device => device.id === propertyId);
            if (device) {
                device.value = value.toFixed(3);
            }
            this.setState({properties: properties});
        }
    }

    onDisconnected(): void {
        this.setState({connectionState: SIConnectionState.DISCONNECTED});
    }

    onError(reason: string): void {
        console.error(reason);
    }


    onEnumerated(status: SIStatus, deviceCount: number): void {}
    onDescription(status: SIStatus, description: any, id?: string): void {}
    onPropertyWritten(status: SIStatus, propertyId: string): void {}
    onPropertySubscribed(status: SIStatus, propertyId: string): void {}
    onPropertyUpdated(propertyId: string, value: any): void {}
    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {}
    onDatalogPropertiesRead(status: SIStatus, properties: Array<string>): void {}
    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: Array<SIDataLogEntry>): void {}
    onMessagesRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {}
    onDeviceMessage(message: SIDeviceMessage): void {}
    onExtensionCalled(extension: string, command: string, status: SIExtensionStatus, parameters: Array<any>): void {}
}

export default App;
