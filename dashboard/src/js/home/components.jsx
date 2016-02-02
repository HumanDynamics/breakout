// hello-world.jsx

import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import NavMenu from './NavMenu';

class Home extends React.Component {
    render() {
        return (
            <div>
                <Nav></Nav>
                <p>Hello, world!</p>
            </div>
        );
    }
}

exports.Home = Home;

class Nav extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleTap = this.handleTap.bind(this);
    }
    
    handleTap() {
        /* this.setState({
           if (this.open)
           this.setState({open: false});
           else
           this.setState({open: true});
           }) */
        console.log(this.refs);
        this.refs.NavMenu.handleToggle();
    }
    
    render() {
        return (
            <div>
                <AppBar
                    title="Breakout Research Dashboard"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                    onLeftIconButtonTouchTap={this.handleTap}
                    onRightIconButtonTouchTap={this.handleTap}
                />
                <NavMenu ref="NavMenu"></NavMenu>
            </div>
        );
    }

}

