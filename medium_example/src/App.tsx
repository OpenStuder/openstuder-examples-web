import React from 'react';

import HighchartsTimeSeries from "./HighchartsTimeSeries";

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
import Connect from "./Connect";

type Device={
  powerId:string,
  value:string|undefined,
}

type Data = {
  readonly timestamp: number,
  readonly value: number,
}

type AppState={
  connectionState:SIConnectionState;
  xTenderMC:Device;
  bsp:Device;
  varioTrackMC:Device;
}

class App extends React.Component<{ }, AppState> implements SIGatewayCallback{

  private siGatewayClient:SIGatewayClient;

  constructor(props:any) {
    super(props);
    this.state={
      connectionState:SIConnectionState.DISCONNECTED,
      xTenderMC:{powerId:"xcom.xts.3023",value:undefined},
      varioTrackMC:{powerId:"xcom.vts.11004",value:undefined},
      bsp:{powerId:"xcom.bat.7003",value:undefined},
    };
    this.siGatewayClient = new SIGatewayClient();
  }

  public componentDidMount() {
    //Set the callback that the SIGatewayClient will call
    this.siGatewayClient.setCallback(this);
  }

  public render() {
  if(this.state.connectionState===SIConnectionState.CONNECTED) {
      let totalPower:number=0;
      if(this.state.xTenderMC.value){
          totalPower +=+ this.state.xTenderMC.value;
      }
      if(this.state.varioTrackMC.value){
          totalPower +=+ this.state.varioTrackMC.value;
      }
      if(this.state.bsp.value){
          totalPower +=(+this.state.bsp.value)/1000;
      }
      let dataPoint:Data = {timestamp:Date.now(), value:totalPower};
      return (
          <div className="App">
              <p>XTender power : {this.state.xTenderMC.value}</p>
              <p>BSP power : {this.state.bsp.value}</p>
              <p>VarioTrack power : {this.state.varioTrackMC.value}</p>
              <p>Total power : {totalPower}</p>
              <HighchartsTimeSeries dataPoint={dataPoint}/>
          </div>
      );
  }
  else if(this.state.connectionState===SIConnectionState.CONNECTING) {
      return (
          <div>
              Connecting...
          </div>
      );
  }
  else {
      return (
          <Connect onConnect={this.onConnect}/>
      );
  }
  }

  private onConnect = (host: string, port: number, username: string | undefined, password: string | undefined) => {
    if (!host.startsWith('ws://')) {
      host = 'ws://' + host;
    }
    this.siGatewayClient.connect(host, port, username, password);
  }

  onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {

  }

  onConnectionStateChanged(state: SIConnectionState): void {
    this.setState({connectionState:state});
  }


  onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
    let propertyIds:string[] = [this.state.xTenderMC.powerId, this.state.bsp.powerId, this.state.varioTrackMC.powerId];
    this.siGatewayClient.subscribeToProperties(propertyIds);
  }

  onDatalogPropertiesRead(status: SIStatus, properties: string[]):void {
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
    //Construct Device with the new value
    let temp: Device = {powerId: propertyId, value: value};
    //Select the good Device to change
    switch (propertyId) {
      case this.state.xTenderMC.powerId:
        this.setState({xTenderMC: temp});
        break;
      case this.state.bsp.powerId :
        this.setState({bsp: temp});
        break;
      case this.state.varioTrackMC.powerId :
        this.setState({varioTrackMC: temp});
        break;
    }
  }

  onPropertyWritten(status: SIStatus, propertyId: string): void {
  }

  onPropertiesRead(results: SIPropertyReadResult[]) {

  }
}

export default App;