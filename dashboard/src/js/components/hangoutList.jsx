// hangoutList.jsx

import React from 'react';
import update from 'react-addons-update';
import _ from 'underscore';

import {HangoutStore} from '../stores/hangoutStore';

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';

import Colors from 'material-ui/lib/styles/colors';
import CheckCircle from 'material-ui/lib/svg-icons/action/check-circle';
import HighlightOff from 'material-ui/lib/svg-icons/action/highlight-off';



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


export default class HangoutTable extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.hangoutsChanged = this.hangoutsChanged.bind(this);
        this.state = {
            hangouts: HangoutStore.getAll()
        }
    }

    
    hangoutsChanged() {
        this.setState({hangouts: update(this.state.hangouts,
                                        {$set: HangoutStore.getAll()})
        });
    }

    componentWillMount() {
    }

    componentDidMount() {
        HangoutStore.bind("change", this.hangoutsChanged);
    }

    componentWillUnmount() {  
        HangoutStore.unbind('change', this.hangoutsChanged);
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
                        <HangoutRow hangout={hangout} key={hangout.hangout_id}></HangoutRow>
                     )};
                </TableBody>
            </Table>
        );
    }
}

