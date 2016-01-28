# breakout

Work in progress

This contains the server-side and plugin-side code for collecting,
sending, and visualizing social physics data in an online Google Hangout.

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
