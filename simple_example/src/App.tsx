import React from 'react';
import logo from "./OpenStuder.svg";
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

type Device = {
    name: string,
    powerId: string,
    value: string | undefined,
}

type AppState = {
    connectionState: SIConnectionState;
    devices: Array<Device>;
}

class App extends React.Component<{}, AppState> implements SIGatewayCallback {

    siGatewayClient: SIGatewayClient;

    constructor(props: any) {
        super(props);
        this.state = {
            connectionState: SIConnectionState.DISCONNECTED,
            devices: Array<Device>(),
        };
        for (let deviceConfig of config.devices) {
            this.state.devices.push({name: deviceConfig.name, powerId: deviceConfig.power_id, value: undefined})
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
        let propertyIds: string[] = this.state.devices.map((it) => it.powerId);
        this.siGatewayClient.readProperties(propertyIds);
    }

    public render() {
        //Display the values and the read button when we are connected
        if (this.state.connectionState === SIConnectionState.CONNECTED) {
            return (
                <div className="App">
                    <h1 className="Title">
                        <div><img src={logo} alt="" className="App-logo"/>
                        </div>
                    </h1>
                    <div className="property-list">
                        {
                            this.state.devices.map(device =>
                                <div>
                                    <div className="label">{device.name} :</div>
                                    <div className="field">
                                        <div className="value">{device.value || '-'}</div>
                                        <div className="unit">W</div>
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
                    <header className="App-header">
                        <h1 className="Title">
                            <div><img src={logo} alt="" className="App-logo"/>
                            </div>
                        </h1>
                        <p>
                            Connecting...
                        </p>
                    </header>
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
        this.siGatewayClient.readDatalog("xcom.11.3023", undefined, undefined, 10);
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
        const devices = this.state.devices;
        results.filter(result => result.status === SIStatus.SUCCESS).forEach(result => {
            const device = this.state.devices.find(device => device.powerId === result.id)
            if (device) {
                device.value = result.value.toFixed(3);
            }
        })
        this.setState({devices: devices});
    }
}

export default App;