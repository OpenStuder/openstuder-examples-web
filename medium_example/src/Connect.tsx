import React from 'react';

interface ConnectProperties {
    onConnect: (host: string, port: number, username: string | undefined, password: string | undefined) => void
}

class ConnectState {
    host: string = 'localhost';
    port: number = 1987;
    username: string | undefined = undefined;
    password: string | undefined = undefined;
}

class Connect extends React.Component<ConnectProperties, ConnectState> {
    constructor(props: ConnectProperties) {
        super(props)
        this.state = new ConnectState();
    }

    public render() {
        return (
            <div>
                <div className="label">Host:</div>
                <input type="text" value={this.state.host} onChange={(event => this.setState({host: event.target.value}))}/>
                <div className="label">Port:</div>
                <input type="number" name="port" form="form" value={this.state.port} onChange={(event => this.setState({port: event.target.valueAsNumber}))}/>
                <div className="label">User:</div>
                <input type="text" name="user" form="form" value={this.state.username} placeholder="no user" onChange={(event => this.setState({username: event.target.value}))}/>
                <div className="label">Password:</div>
                <input type="text" value={this.state.password} onChange={(event => this.setState({password: event.target.value}))} placeholder="no password"/>
                <br/>
                <input type="submit" value="connect" onClick={this.onConnectButtonClicked}/>
            </div>
        );
    }

    private onConnectButtonClicked = () => {
        this.props.onConnect(this.state.host, this.state.port, this.state.username, this.state.password);
    }
}

export default Connect;
