import React from 'react'
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';

export default class NavMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {open: false};
        this.handleToggle = this.handleToggle.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleToggle() {
        this.setState({open: !this.state.open});
    }

    handleClose() {
        this.setState({open: false});
    }

    render() {
        return (
            <LeftNav
                docked={false}
                width={200}
                open={this.state.open}
                onRequestChange={open => this.setState({open})}
            >
                <MenuItem onTouchTap={this.handleClose}>Active Hangouts</MenuItem>
                <MenuItem onTouchTap={this.handleClose}>History</MenuItem>
            </LeftNav>
        );
    }
}
