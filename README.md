# breakout

An open measurement and feedback tool for online conversations, from
the Human Dynamics group at the MIT Media Lab.

Breakout is a modern iteration of the
[Meeting Mediator](http://hd.media.mit.edu/tech-reports/TR-616.pdf), a
tool to enhance group collaboration. Breakout measures the
conversation patterns of a Google Hangout (or other online
conversation), and provides team members with a real-time
visualization of their communication patterns.

The original Meeting Mediator worked by
measuring the social dynamics of a team using
[sociometric badges](http://web.media.mit.edu/~dolguin/ISWC07SCv3-DOO.pdf),
and then visualizing the collected data in an ambient display. The
display is designed both to encourage group members to participate more
equally, and to be non-distracting.

# For Developers

Breakout is an open-source software project, and we're actively
looking for contributors from other sources. To start helping out,
follow the steps below!

## Stack

Breakout is currently split between the client and the server. The
stack for each is a little different:

### Server
(in `/server`)
- [NodeJS](https://nodejs.org/en/) is the platform the server is built
  on. 
- [Express](http://expressjs.com/) is the web framework Breakout's
  server is build around.
- [Socket.io](http://socket.io/) is the real-time events engine used
  to move data between clients and the server.
- [FeathersJS](http://feathersjs.com/) runs the real-time service
  architecture on the back-end. All of the data is created through
  feathers, and feathers pushes updates to clients. FeathersJS is a
  compatible wrapper over Express & Socket.io.
- **MongoDB** is the datastore we're using.

### Client / Plugin
(in `/plugin`)
- Plain ol' Javascript :heart:
- [RequireJS](http://requirejs.org/) for deps and pasting everything together
- [D3.js](https://d3js.org/) for the visualization
- [Materialize.css](http://materializecss.com/) for the css/html framework for the client plug-in

## Installation 

Installing / running Breakout locally is, as a whole, not really
possible. Because the client is a Google Hangouts plugin, you need to
actually create a Google hangout app that communicates with the
server. To fully run your own instance of the tool, first run the
server on a publicly-accessible server with HTTPS enabled. Then,
follow the next two steps to get things rolling.

### Server

1. Clone the repo
`git clone git@github.com:HumanDynamics/breakout.git`
2. 
- 


To run a Google Hangout plugin, you need to actually
create a Google Hangout app as described by Google themselves. You can do this through the [Google Developer Console](https://console.developers.google.com/). Create a new project, 

## Installation

TODO

1. Create a google hangout app as described by Google themselves.

2. Generate the plugin.xml file by using the `create-client.sh` script in the `plugin-app/src` directory.

3. Run the meteor back-end by executing `meteor run` in the `app` directory.

5. Change the javascript Asteroid code in `lib.js` to connect to your
   meteor server instead of the one that's hardcoded in there

4. Install your plugin in a hangout!


## Notes from using feathers

### Calling services from the server
- when you use the `find` functionality, you have to send any query in the following format:

```
    { query: { <attr>: <param>} }
```
(just adding query to the front)
