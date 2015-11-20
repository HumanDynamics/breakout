# window.herfindahl = new Herfindahl window.state.hangoutId, 300, 400
# window.herfindahl.render('#herfindahl-chart')


pieWidth = 300
pieHeight = 300

herfWidth = 300
herfHeight = 300

#console.log $(window).width

collectedHerf = []

setInterval(() =>
  if !window.state
    console.log("[charts] uh, no state object??")
    return;
  if window.state.hangoutId
    if !window.state.pie
      window.state['pie'] = null
    talkTimePromise = window.state.conn.call('getTotalTimeSpoken', state.hangoutId, 60 * 1).result

    talkTimePromise.then( ((result) =>
      if window.state.pie
        if !_.isEqual(window.state.pie.data, result)
          console.log("[charts] update data:", result);
          window.state.pie.change(result)
      else
        window.state.pie = new PieChart result, pieWidth, pieHeight
        console.log("[charts] render:", window.state.pie)
        window.state.pie.render('#pie-chart')
      ),
      (error) =>
        console.log("[charts] error with talk time promise...", error)
      )
,
1000)

    # herfindahl

setInterval(() =>
  if !window.state
    return;
    # if the chart doesnt exist, then initialize the state variable
  if !window.state.herfindahl
    window.state['herfindahl'] = null

  # callback for herfindahl data in general.
  herfindahlPromise = window.state.conn.call('getHerfindahl', state.hangoutId, 60 * 5).result

  #TODO: herfindahl is always null here, not sure why.
  herfindahlPromise.then( ((result) =>
    #TODO: What the hell is this?
    result.h_index = result.h_index['$InfNaN'];

    result.timestamp = (new Date(result.timestamp)).getTime()
      # if we have less than 3 buffered data points, just wait for more.
    # in either case, we check to make sure we're not inserting redundant data.
    if (collectedHerf.length < 3)
      if !_.find(collectedHerf, result)
        collectedHerf.push(result)
    # otherwise, push it in / update
    else if window.state.herfindahl
      if !_.find(window.state.herfindahl.data, result)
        console.log("[charts] updating herf data: ", result)
        window.state.herfindahl.updateData(result)
    else
      console.log "rendering herfindahl chart with buffered data:", collectedHerf
      window.state.herfindahl = new Herfindahl collectedHerf, herfWidth, herfHeight
      console.log("[charts] render: ", window.state.herfindahl)
      window.state.herfindahl.render("#herfindahl-chart")
    ), (error) =>
      console.log("[charts] error with herfindahl promise")
    )
, 1000)
