// hangoutList.jsx

import React from 'react';
import update from 'react-addons-update';
import io from 'socket.io-client';
import feathers from 'feathers-client';
import _ from 'underscore';


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
        this.updateHangout = this.updateHangout.bind(this);
        this.state = {
            hangouts: []
        };
    }

    // updates a hangout with a new object.
    // first finds it by looking at the `hangout_id` of that hangout, and then
    // replaces it in this.state using the update pattern.
    updateHangout(hangoutObject) {
        // find hangout index in state
        var n = _.findIndex(this.state.hangouts,
                            (hangout) => hangout.hangout_id == hangoutObject.hangout_id);
        // update that hangout object with the new one
        if (n) 
            this.setState({hangouts: update(this.state.hangouts,
                                            {[n]: {$set: hangoutObject}})});
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
        // add one every time it's created.
        this.hangouts.on('created', function(hangout) {
            this.setState({hangouts: update(this.state.hangouts,
                                            {$push: [hangout]})});
        }.bind(this));

        // find initial data
        this.hangouts.find(
             {
                 $sort: {start_time: -1},
            }, function(error, foundHangouts) {
                console.log("found hangouts:", foundHangouts);
                foundHangouts.map(function(hangout) {
                    this.setState({hangouts: this.state.hangouts.concat(hangout)});
                }, this);
            }.bind(this));

        // on patched
        this.hangouts.on('patched', function(updatedHangout) {
            console.log("updated hangout:", updatedHangout);
            this.updateHangout(updatedHangout);
            }.bind(this))
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
