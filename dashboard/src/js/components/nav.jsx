import React from 'react'
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';
import AppBar from 'material-ui/lib/app-bar';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'

export default class Nav extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleTap = this.handleTap.bind(this);
    }
    
    handleTap() {
        console.log(this.refs);
        this.refs.NavMenu.handleToggle();
    }
    
    render() {
        return (
            <div>
                <AppBar
                    title={<Link to="/">Breakout</Link>}
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                    onLeftIconButtonTouchTap={this.handleTap}
                />
                <NavMenu ref="NavMenu"></NavMenu>
            </div>
        );
    }

}

class NavMenu extends React.Component {

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
                <MenuItem onTouchTap={this.handleClose}>
                    <Link to="/dashboard">Dashboard</Link></MenuItem>
                <MenuItem onTouchTap={this.handleClose}>History</MenuItem>
            </LeftNav>
        );
    }
}
