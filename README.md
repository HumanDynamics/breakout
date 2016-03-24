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
2. `cd breakout/server`
2. run `npm install` to install node dependencies
3. run `node app.js` directory to start the server.

To use the server with an actual Hangouts plugin, HTTPS needs to be running on the web server that hosts the server. If you'd like to run it through nginx, I've included some configuration snippets down below.

### Config file
Once the server is running, edit `breakout/config.json`. It should look like:

```json
{
    "serverUrl": "https://url.server.com....",
    "appId": "123456789"
}
```

- `serverUrl` is the `https`-accessible URL you're running Breakout through. 
- `appId`: Once you configure your own Google Hangouts plugin, you'll have an app ID that you can enter here.

Once you know these two values (`appId` will become clear after configuring the Google API), edit this file appropriately.

### Plugin
1. `cd breakout/plugin/src`
2. `npm install` to install node dependencies, used for building the plugin file (I know, I know...)
3. `bower install` to install the bower dependencies that the plugin actually uses.
4. `node build.js` to build the plugin. This will populate the `index.html` file with the `serverUrl` you specify in `breakout/config.json`. Remember to re-build after editing `serverUrl` in `config.json`.

This should also build a `plugin/src/plugin.xml` file in the repo. This is the file that Google Hangouts will serve to users opening the hangouts plugin. If you want to create your own plugin, you now need to create a new Google Developer Console project, configure it to use the Google Hangouts API, and point it at the `plugin.xml` file that was just generated.


### Configure the Google API

![Configuring a Google Hangout API](http://i.imgur.com/PY0YyDO.gif)
[video here](https://vimeo.com/160266573)

To run a Google Hangout plugin, you need to actually
create a Google Hangout app as described by Google themselves. You can do this through the [Google Developer Console](https://console.developers.google.com/). Follow the video above to configure the plugin.

The URL of the `plugin.xml` file you enter must be an HTTPS url.

After configuring the API, you need to grab the app ID to enter into `breakout/config.json`. You can only do this after configuring OAuth on your app. 
1.  Click `credentials`
2.  enter info into the `OAuth Consent Screen` tab
3.  Click `Create Credentials->OAuth Client ID`
4.  Click `other`
5.  The first bit (13-digits) of your client ID that looks like `1095645588088` is your Client ID, and that is what to enter as the `appId` in  `breakout/config.json`.

![Configuring Oauth + getting App ID](http://i.imgur.com/LFMuW0q.gifv)
