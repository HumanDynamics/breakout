# window.herfindahl = new Herfindahl window.state.hangoutId, 300, 400
# window.herfindahl.render('#herfindahl-chart')


pieWidth = 300
pieHeight = 300

window.pie = null

setInterval(() =>
  if !window.state
    console.log("[charts] uh, no state object??")
    return;
  if window.state.hangoutId
    talkTimePromise = window.state.conn.call('getTotalTimeSpoken', state.hangoutId, 60 * 1).result

    talkTimePromise.then( ((result) =>
      if window.pie
        if !_.isEqual(window.pie.data, result)
          console.log("[charts] blah:", d3.select('#pie-chart'))
          console.log("[charts] update data:", result);
          window.pie.change(result)
      else
        window.pie = new PieChart result, pieWidth, pieHeight
        console.log("[charts] render:", window.pie)
        window.pie.render('#pie-chart')
      ),
      (error) =>
        console.log("[charts] error with talk time promise...", error)
      )
, 1000)
