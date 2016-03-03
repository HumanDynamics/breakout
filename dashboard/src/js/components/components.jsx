// hello-world.jsx

import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import NavMenu from './NavMenu';
import HangoutTable from './hangoutList';



class Nav extends React.Component {
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

class Home extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {tab: 0}
    }

    pageBody() {
        console.log("pagebody");
        switch (this.state.tab) {
            case 0:
                return (<HangoutTable></HangoutTable>);
            case 1:
                return (<p>user Table</p>);
            default:
                return (<p>Hello World!</p>);
        }
    }
    
    render() {
        return (
            <div>
                <Nav></Nav>
                {this.pageBody()}
            </div>
        );
    }
}

exports.Home = Home;
