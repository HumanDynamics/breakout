import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'
import AppBar from 'material-ui/lib/app-bar';
import Home from './components/home'
import Dashboard from './components/dashboard'
import Nav from './components/nav'
import HangoutListAPIUtils from './api/HangoutListAPIUtils';
import ParticipantAPIUtils from './api/ParticipantAPIUtils';
import $ from 'jquery';


const App = React.createClass({
    render() {
        return (
            <div>
                <Nav
                    style={{
                            color: 'green500';
                        }}>
                    
                </Nav>
                {this.props.children}
            </div>
        )
    }
});


var routeComponent = (
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Home} />
            <Route path="dashboard" component={Dashboard} />
        </Route>
    </Router>);

    
const app = {
    initialize: function() {
        console.log('Trying to render main...');
        injectTapEventPlugin();
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        console.log("Device ready, will try to render main !");
        const mountNode = document.getElementById('reactAppContainer');
        ReactDOM.render(routeComponent, mountNode);
        
        HangoutListAPIUtils.getAllHangouts();
        HangoutListAPIUtils.registerCreatedCallback();
        HangoutListAPIUtils.registerChangedCallback();
        
        ParticipantAPIUtils.getAllParticipants();
        ParticipantAPIUtils.registerCreatedCallback();
        ParticipantAPIUtils.registerChangedCallback();
    }
};

    
app.initialize();

