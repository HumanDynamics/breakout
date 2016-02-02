// hangoutList.jsx

import React from 'react';
import io from 'socket.io-client';
import feathers from 'feathers-client';

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';


import Colors from 'material-ui/lib/styles/colors';
import CheckCircle from 'material-ui/lib/svg-icons/action/check-circle';
import HighlightOff from 'material-ui/lib/svg-icons/action/highlight-off';


export default class HangoutTable extends React.Component {
    constructor(props, context) {
        super(props, context);
        /* this.componentWillMount = this.componentWillMount.bind(this); */
        this.state = {
            hangouts: []
        };
    }

    componentWillMount() {
        console.log("will mount hangout table...");
        this.socket = io.connect('breakout-dev.media.mit.edu', {'transports': [
            'websocket',
            'flashsocket',
            'jsonp-polling',
            'xhr-polling',
            'htmlfile'
        ]});

        this.app = feathers().configure(feathers.socketio(this.socket));
        this.hangouts = this.app.service('hangouts');
    }

    componentDidMount() {
        this.hangouts.on('created', function(hangout) {
            this.setState({hangouts: this.state.hangouts.concat(hangout)});
        }.bind(this));

        this.hangouts.find({}, function(error, foundHangouts) {
            console.log("found hangouts:", foundHangouts);
            foundHangouts.map(function(hangout) {
                this.setState({hangouts: this.state.hangouts.concat(hangout)});
            }, this);
        }.bind(this));
    }

    render() {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHeaderColumn>Hangout ID</TableHeaderColumn>
                        <TableHeaderColumn>Active?</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {this.state.hangouts.map((hangout, i) =>
                        <HangoutRow hangout={hangout} key={i}></HangoutRow>
                    )};
                </TableBody>
            </Table>
        );
    }
}

class HangoutRow extends React.Component {
    constructor(props, context) {
        console.log("props:", props);
        super(props, context);
    }


    getIcon(active) {
        if (active) {
            return (
                <CheckCircle color={Colors.green500} />
            );
        } else {
            return (
                <HighlightOff color={Colors.red500} />
            );
        }
    }

    render() {
        return (
            <TableRow>
                <TableRowColumn>{this.props.hangout.hangout_id}</TableRowColumn>
                <TableRowColumn>{this.getIcon(this.props.hangout.active)}</TableRowColumn>
            </TableRow>
        );
    }
}
