import React, {RefObject} from 'react';
import HighchartsTimeSeries from "./HighchartsTimeSeries";
import {SIAccessLevel, SIConnectionState, SIDeviceMessage, SIGatewayClientCallbacks, SIGatewayClient, SIPropertyReadResult, SIStatus, SISubscriptionsResult} from "@openstuder/openstuder";
import Connect from "./Connect";

class Device {
    constructor(name: string, powerId: string, unit: string = '', sumFactor: number = 1.0) {
        this.name = name
        this.powerId = powerId
        this.value = undefined;
        this.unit = unit;
        this.sumFactor = sumFactor;
    }

    public name: string;
    public powerId: string;
    public value: number | undefined;
    public unit: string;
    public sumFactor: number;
}

class AppState {
    constructor(devices: Array<Device>) {
        this.connectionState = SIConnectionState.DISCONNECTED;
        this.devices = devices;
        this.powerSum = 0;
    }

    public connectionState: SIConnectionState;
    public devices: Array<Device>;
    public powerSum: number;
}

class App extends React.Component<{}, AppState> implements SIGatewayClientCallbacks {

    private siGatewayClient: SIGatewayClient;
    private readonly chart: RefObject<HighchartsTimeSeries>;

    constructor(props: any) {
        super(props);
        this.state = new AppState([
            new Device('Demo inverter', 'demo.inv.3136', 'kW'),
            new Device('Demo solar charger', 'demo.sol.11004', 'kW', 0),
            new Device('Demo battery', 'demo.bat.7003', 'W', 0)
        ]);
        this.siGatewayClient = new SIGatewayClient();
        this.chart = React.createRef();
    }

    public componentDidMount() {
        // Set the callback that the SIGatewayClient will call
        this.siGatewayClient.setCallback(this);
    }

    public render() {
        switch (this.state.connectionState) {
            case SIConnectionState.DISCONNECTED:
                return (
                    <Connect onConnect={this.onConnect}/>
                );

            case SIConnectionState.CONNECTING:
            case SIConnectionState.AUTHORIZING:
                return (
                    <div>Connecting...</div>
                );

            case SIConnectionState.CONNECTED:
                return (
                    <div className="App">
                        <div className="device-list">
                            {
                                this.state.devices.map(device =>
                                    <div>
                                        <div className="label">{device.name} :</div>
                                        <div className="field">
                                            <div className="value">{device.value?.toFixed(3) || '-'}</div>
                                            <div className="unit">{device.unit}</div>
                                        </div>
                                    </div>
                                )
                            }
                            <div>
                                <div className="label">Total power</div>
                                <div className="field">
                                    <div className="value">{this.state.powerSum.toFixed(3)}</div>
                                    <div className="unit">kW</div>
                                </div>
                            </div>

                        </div>
                        <HighchartsTimeSeries className="chart" backgroundColor="rgba(84, 156, 181, 0.2)" ref={this.chart}/>
                        <input type="submit" value="disconnect" onClick={this.onDisconnect}/>
                    </div>
                );
        }
    }


    // Event handlers.

    private onConnect = (host: string, port: number, username: string | undefined, password: string | undefined) => {
        // If the host string is missing the URL scheme, add it.
        if (!host.startsWith('ws://')) {
            host = 'ws://' + host;
        }

        // Connect to the gateway.
        this.siGatewayClient.connect(host, port, username, password);
    }

    private onDisconnect = () => {
        this.siGatewayClient.disconnect();
    }


    // SIGatewayCallback implementation.

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        this.siGatewayClient.subscribeToProperties(this.state.devices.map(device => device.powerId));
    }




    onPropertyUpdated(propertyId: string, value: any): void {
        const devices = this.state.devices;
        const device = this.state.devices.find(device => device.powerId === propertyId)
        if (device) {
            device.value = parseFloat(value);

            if (device.sumFactor !== 0) {
                let powerSum: number = 0;
                this.state.devices.filter(device => device.sumFactor !== 0).forEach(device => powerSum += device.sumFactor * (device.value || 0))
                this.setState({devices: devices, powerSum: powerSum});
                this.chart?.current?.addPoint(powerSum);
            } else {
                this.setState({devices: devices});
            }
        }
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {}
    onPropertiesRead(results: SIPropertyReadResult[]) {}
    onPropertyWritten(status: SIStatus, propertyId: string): void {}
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
    onPropertiesFound(status: SIStatus, id: string, count: number, properties: string[]): void {}
}

export default App;
