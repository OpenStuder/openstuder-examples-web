import React from 'react';
import './App.css';
import logo from "./OpenStuder.svg";

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

  siGatewayClient:SIGatewayClient;
  host:string;
  port:number;
  user:string;
  password:string;

  constructor(props:any) {
    super(props);
    this.state={
      connectionState:SIConnectionState.DISCONNECTED,
      xTenderMC:{powerId:"xcom.xts.3023",value:undefined},
      varioTrackMC:{powerId:"xcom.vts.11004",value:undefined},
      bsp:{powerId:"xcom.bat.7003",value:undefined},
    };
    this.siGatewayClient = new SIGatewayClient();
    this.host="";
    this.port=1987;
    this.user="";
    this.password="";
  }

  public componentDidMount() {
    //Set the callback that the SIGatewayClient will call
    this.siGatewayClient.setCallback(this);
  }

  public onChangeHost(event:React.ChangeEvent<HTMLInputElement>){
    this.host=event.target.value;
  }

  public onChangePort(event:React.ChangeEvent<HTMLInputElement>){
    if(+event.target.value) {
      this.port = +event.target.value;
    }
    else{
      this.port=1987;
    }
  }

  public onChangeUser(event:React.ChangeEvent<HTMLInputElement>){
    this.user=event.target.value;
  }

  public onChangePassword(event:React.ChangeEvent<HTMLInputElement>){
    this.password=event.target.value;
  }

  public onSubmit(){
    //Try to connect with the server
    this.siGatewayClient.connect(this.host,this.port, this.user, this.password);
  }

  public renderConnected(){
    //Display the values and the read button when we are connected
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
            <header className="App-header">
              <h1 className="Title">
                <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
                </div>
              </h1>
              <p>XTender power : {this.state.xTenderMC.value}</p>
              <p>BSP power : {this.state.bsp.value}</p>
              <p>VarioTrack power : {this.state.varioTrackMC.value}</p>
              <p>Total power : {totalPower}</p>
              <HighchartsTimeSeries dataPoint={dataPoint}/>
            </header>
          </div>
      );
  }
  public renderConnecting(){
    //Display that the client tries to connect
    return(
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
              </div>
            </h1>
            <p>
              Connecting...
            </p>
          </header>
        </div>
    );
  }

  public renderDisconnected(){
    return(
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
              </div>
            </h1>
          </header>
          <p>Host:</p><input type="text" name="host" form="form" onChange={(event => this.onChangeHost(event))}/><br/>
          <p>Port:</p><input type="text" name="port" form="form" onChange={(event => this.onChangePort(event))}/><br/>
          <p>User:</p><input type="text" name="user" form="form" onChange={(event => this.onChangeUser(event))}/><br/>
          <p>Password:</p><input type="text" name="password" form="form" onChange={(event => this.onChangePassword(event))}/><br/>
          <input type="submit" value="connect" form="form" onClick={()=>this.onSubmit()}/><br/>
        </div>
    );
  }

  public render() {
  if(this.state.connectionState===SIConnectionState.CONNECTED) {
    return(
        <div>
          {this.renderConnected()}
        </div>
    );
  }
  else if(this.state.connectionState===SIConnectionState.CONNECTING) {
    return(
        <div>
          {this.renderConnecting()}
        </div>
    );
  }
  else {
    return (
        <div>
          {this.renderDisconnected()}
        </div>);
    }
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