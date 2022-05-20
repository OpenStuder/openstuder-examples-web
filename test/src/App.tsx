import React from 'react';

import {SIAccessLevel, SIDeviceFunctions, SIDeviceMessage, SIGatewayClient, SIGatewayClientCallbacks, SIPropertyReadResult, SIStatus, SISubscriptionsResult} from "@openstuder/openstuder";

// Retrieve the user's configuration in the package.json file
const config = require('../package.json').config;

enum TestCaseStatus {
    WAITING,
    FAILED,
    SUCCEEDED
}

class AppState {
    public testCases: Map<string, TestCaseStatus>;
    public currentTestCase?: string = undefined;

    constructor() {
        this.testCases = new Map ();
    }
}

class App extends React.Component<{}, AppState> implements SIGatewayClientCallbacks {
    private client: SIGatewayClient;

    constructor(props: any) {
        super(props);
        this.client = new SIGatewayClient();
        this.client.setDebugEnabled(true);
        this.state = new AppState()
    }

    public componentDidMount() {
        // Set the callback that the SIGatewayClient will call
        this.client.setCallback(this);

        // Try to connect with the server if the configuration owns a host value
        if (config.host !== undefined) {
            this.startTestCase("Connect");
            this.client.connect(config.host, config.port, config.user, config.password);
        } else {
            // No host value
            throw new Error("No host found, check if \"package.json\" owns a \"config\" object with a \"host\" key");
        }
    }

    public render() {
        return (
            <ul>
                {
                    Array.from(this.state.testCases, ([desc, status]) => {
                        return (
                            <li key={desc as string}>
                                {this.renderDescription(desc)}:
                                {this.renderStatus(status)}
                            </li>
                        )
                    })
                }
            </ul>
        )
    }

    private renderDescription(description: string) {
        if (description === this.state.currentTestCase) {
            return <strong>{description}</strong>
        } else {
            return <span>{description}</span>
        }
    }

    private renderStatus(status: TestCaseStatus) {
        switch (status) {
            case TestCaseStatus.WAITING:
                return <span>-</span>;

            case TestCaseStatus.FAILED:
                return <span color="red">FAILED</span>;

            case TestCaseStatus.SUCCEEDED:
                return <span color="green">SUCCEEDED</span>;
        }
    }

    private startTestCase(description: string) {
        let testCases = this.state.testCases;
        testCases.set(description, TestCaseStatus.WAITING);
        this.setState({
            testCases: testCases,
            currentTestCase: description
        });
    }

    private currentTestCase(): string | undefined {
        return this.state.currentTestCase;
    }

    private updateTestCase(status: TestCaseStatus) {
        let testCases = this.state.testCases;
        testCases.set(this.state.currentTestCase!, status);
        this.setState({
            testCases: testCases
        });
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        this.updateTestCase(TestCaseStatus.SUCCEEDED);

        this.startTestCase("Enumerate");
        this.client.enumerate();
    }

    onEnumerated(status: SIStatus, deviceCount: number): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        this.startTestCase("Describe gateway");
        this.client.describe();
    }

    onDescription(status: SIStatus, description: string, id?: string): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        if (!id) {
            this.startTestCase("Describe device access");
            this.client.describe("demo");

        } else if (id === "demo") {
            this.startTestCase("Describe device");
            this.client.describe("demo.inv");
        } else if (id === "demo.inv") {
            this.startTestCase("Find properties");
            this.client.findProperties("*.*.3059", false, [SIDeviceFunctions.INVERTER]);
        }
    }

    onPropertiesFound(status: SIStatus, id: string, count: number, virtual: boolean, functions: Set<SIDeviceFunctions>, properties: string[]): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        this.startTestCase("Read property");
        this.client.readProperty("demo.inv.3049");
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        this.startTestCase("Read properties");
        this.client.readProperties(["demo.inv.3049", "demo.inv.3032"]);
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        let status = TestCaseStatus.SUCCEEDED;
        results.forEach((result) => {
            if (result.status !== SIStatus.SUCCESS) {
                status = TestCaseStatus.FAILED;
            }
        });

        this.updateTestCase(status);

        this.startTestCase("Subscribe property");
        this.client.subscribeToProperty("demo.inv.3049");
    }

    onPropertySubscribed(status: SIStatus, propertyId: string): void {
        if (status !== SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.FAILED);
    }

    onPropertyUpdated(propertyId: string, value: any): void {
        if (this.currentTestCase() === "Subscribe property") {
            this.updateTestCase(TestCaseStatus.SUCCEEDED);

            this.startTestCase("Unsubscribe property");
            this.client.unsubscribeFromProperty("demo.inv.3049");
        }

        if (this.currentTestCase() === "Subscribe properties") {
            this.updateTestCase(TestCaseStatus.SUCCEEDED);

            this.startTestCase("Unsubscribe properties");
            this.client.unsubscribeFromProperties(["demo.inv.3049", "demo.inv.3032"]);
        }
    }

    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        this.startTestCase("Subscribe properties");
        this.client.subscribeToProperties(["demo.inv.3049", "demo.inv.3032"]);
    }

    onPropertiesSubscribed(statuses: SISubscriptionsResult[]) {
        statuses.forEach((result) => {
            if (result.status !== SIStatus.SUCCESS) {
                this.updateTestCase(TestCaseStatus.FAILED);
            }
        });
    }

    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]) {
        let status = TestCaseStatus.SUCCEEDED;
        statuses.forEach((result) => {
            if (result.status !== SIStatus.SUCCESS) {
                status = TestCaseStatus.FAILED;
            }
        });
        this.updateTestCase(status);

        this.startTestCase("Write property");
        this.client.writeProperty("demo.inv.1399");
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        if (this.currentTestCase() == "Write property") {
            this.startTestCase("Device message");
            this.client.writeProperty("demo.inv.1415");
        }
    }

    onDeviceMessage(message: SIDeviceMessage): void {
        if (this.currentTestCase() == "Device message") {
            this.updateTestCase(TestCaseStatus.SUCCEEDED);

            this.startTestCase("Read messages");
            this.client.readMessages();
        }
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        this.startTestCase("Read datalog properties");
        this.client.readDatalogProperties();
    }

    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        console.log(properties);

        /*if (properties.length > 0) {
            this.startTestCase("Read datalog");
            this.client.readDatalog(properties[0]);
        } else {*/
            this.startTestCase("Disconnect");
            this.client.disconnect();
       // }
    }

    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {
        if (status === SIStatus.SUCCESS)
            this.updateTestCase(TestCaseStatus.SUCCEEDED);
        else
            this.updateTestCase(TestCaseStatus.FAILED);

        this.startTestCase("Disconnect");
        this.client.disconnect();
    }

    onDisconnected(): void {
        this.updateTestCase(TestCaseStatus.SUCCEEDED);
    }

    onError(reason: string): void {
        this.updateTestCase(TestCaseStatus.FAILED);
    }
}

export default App;
