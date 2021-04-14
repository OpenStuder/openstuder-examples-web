import React from "react";
import {Device, getPropertyValue} from "./Devices";
import dashboard from "./ressources/dashboard.png";

type SysInfoProps={
    battery:Device|undefined,
    varioTrack:Device|undefined,
    xTender:Device|undefined
}

class SystemInfo extends React.Component<SysInfoProps, {}>{
    constructor(props:any) {
        super(props);
    }

    public render(){
        if(this.props.battery&&this.props.varioTrack&&this.props.xTender) {
            let vtPower= new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(+getPropertyValue(this.props.varioTrack,11004));
            let xtPower= new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(+getPropertyValue(this.props.xTender,3137));
            let bspPower= new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(+getPropertyValue(this.props.battery,7003));
            let hPower= new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(+vtPower+(+xtPower)+(+bspPower)/1000);
            return (
                <div className="dashboard">
                    <img src={dashboard}/>
                    <div className="VTPower">{""+vtPower}</div>
                    <div className="XTPower">{""+xtPower}</div>
                    <div className="BSPPower">{""+bspPower}</div>
                    <div className="BSPCharge">{""+getPropertyValue(this.props.battery,7002)}</div>
                    <div className="HousePower">{""+hPower}</div>
                </div>
            );
        }
        else{
            return(
                <div></div>
            );
        }
    }
}

export default SystemInfo;