import React from 'react';
import refresh from "./refresh.svg";

import {
    SIAccessLevel,
    SIConnectionState,
    SIDeviceMessage,
    SIGatewayCallback,
    SIGatewayClient,
    SIPropertyReadResult,
    SIStatus,
    SISubscriptionsResult
} from "@marcocrettena/openstuder";

//Retrieve the user's configuration in the package.json file
const config = require("../package.json").config;

type Property = {
    name: string,
    id: string,
    unit: string,
    value: string | undefined,
}

type AppState = {
    connectionState: SIConnectionState;
    properties: Array<Property>;
}

class App extends React.Component<{}, AppState> implements SIGatewayCallback {

    siGatewayClient: SIGatewayClient;

    constructor(props: any) {
        super(props);
        this.state = {
            connectionState: SIConnectionState.DISCONNECTED,
            properties: Array<Property>(),
        };
        for (let deviceConfig of config.properties) {
            this.state.properties.push({name: deviceConfig.name, id: deviceConfig.id, unit: deviceConfig.unit, value: undefined})
        }
        this.siGatewayClient = new SIGatewayClient();
    }

    public componentDidMount() {
        //Set the callback that the SIGatewayClient will call
        this.siGatewayClient.setCallback(this);
        //Try to connect with the server if the configuration owns a host value
        if (config.host !== undefined) {
            this.siGatewayClient.connect(config.host, config.port, config.user, config.password);
        }
        //No host value
        else {
            throw new Error("No host found, check if \"package.json\" owns a \"config\" object with a \"host\" key");
        }
    }

    public onClick() {
        //When button is pressed : read all wanted properties
        let propertyIds: string[] = this.state.properties.map((it) => it.id);
        this.siGatewayClient.readProperties(propertyIds);
    }

    public render() {
        //Display the values and the read button when we are connected
        if (this.state.connectionState === SIConnectionState.CONNECTED) {
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
                    <button className="read" onClick={() => this.onClick()}><img src={refresh} height="32" alt="read"/></button>
                </div>
            );
        }
        //Display that the client tries to connect
        else {
            return (
                <div className="App">
                    <h1>
                        Connecting...
                    </h1>
                </div>
            );
        }
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {

    }

    onConnectionStateChanged(state: SIConnectionState): void {
        this.setState({connectionState: state});
    }


    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
    }

    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void {
    }

    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {
    }

    onDescription(status: SIStatus, description: string, id?: string): void {
    }

    onDeviceMessage(message: SIDeviceMessage): void {
    }

    onDisconnected(): void {
    }

    onEnumerated(status: SIStatus, deviceCount: number): void {
    }

    onError(reason: string): void {
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {

    }

    onPropertySubscribed(status: SIStatus, propertyId: string): void {
    }

    onPropertiesSubscribed(statuses: SISubscriptionsResult[]) {
    }

    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {
    }

    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]) {
    }

    onPropertyUpdated(propertyId: string, value: any): void {
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
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
}

export default App;