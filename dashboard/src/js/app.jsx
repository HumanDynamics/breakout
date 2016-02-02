import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import HomeComponents from 'home/components';
import $ from 'jquery';
const Home = HomeComponents.Home;

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
        ReactDOM.render(<Home name="Dear User!" />, mountNode);        
    }
};

    
app.initialize();

