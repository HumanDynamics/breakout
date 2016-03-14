// hello-world.jsx
import React from 'react';
import HangoutTable from './hangoutList';


export default class Dashboard extends React.Component {
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
                 {this.pageBody()}
            </div>
        );
    }
}
