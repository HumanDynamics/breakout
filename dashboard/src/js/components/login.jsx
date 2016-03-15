import React from 'react';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';

export default class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleLoginClick = this.handleLoginClick.bind(this);
    }

    handleLoginClick(event) {
        var username = this.refs.username.getValue();
        var password = this.refs.password.getValue();
        console.log("username:", username, "password:", password);
        //TODO: DO AUTH
    }

    render() {
        return (
            <div style={{
                    display: 'flex',
                }}>
                <div style={{
                        margin: 'auto'
                    }}>
                    <TextField
                        ref="username"
                        hintText="Username"
                        floatingLabelText="Username"
                    /><br/>
                    <TextField
                        ref="password"
                        hintText="Password"
                        floatingLabelText="Password"
                        type="password"
                    /><br/>
                    <FlatButton
                        label="Log In"
                        secondary={true}
                        onClick={this.handleLoginClick}/>
                </div>
            </div>
        );
    }
}
