# window.herfindahl = new Herfindahl window.state.hangoutId, 300, 400
# window.herfindahl.render('#herfindahl-chart')


pieWidth = 300
pieHeight = 300

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
, 1000)
