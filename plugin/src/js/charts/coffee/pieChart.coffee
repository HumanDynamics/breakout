define ['d3', 'underscore'], (d3, underscore) ->
  class PieChart
    constructor: (data, localParticipantId, width, height) ->

      @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"
      @localParticipant = localParticipantId

      @data = data
      @prevData = data  # to keep track of previous data step. same at first for now.

      console.log("[pieChart] data:", @data);

      @margin = {top: 10, right: 10, bottom: 10, left: 10}

      @width = width - @margin.right - @margin.left
      @height = width - @margin.top - @margin.bottom

      @radius = d3.min([@width, @height]) / 2

      @arc = d3.svg.arc()
        .innerRadius(@radius - 50)
        .outerRadius(@radius - 20)

      # key function to access arc/data identifiers
      @key = (d) -> d.data.participant_id

      @pie = d3.layout.pie()
        .value (d) -> d.seconds_spoken
        .sort(null);

      # @color = (n) ->
      #   g_colors[n % g_colors.length]

      @color = (d) =>
        if (d.data.participant_id == @localParticipant)
          return "#22A7F0"
        else
          return "#D2D7D3"
      console.log "local participant:", @localParticipant

      @loading = true


    render: (id="#pie-chart", cb) =>

      @chart = d3.select(id)
        .append "svg"
        .attr "class", "pieChart"
        .attr "width", @width + @margin.left + @margin.right
        .attr "height", @height + @margin.top + @margin.bottom
        .append "g"
        .attr "transform", "translate(" + (@width / 2) + "," + (@height / 2) + ")"

      @chartBody = @chart.append "g"

      @path = @chartBody
        .selectAll "path"
        .data @pie(@data)
        .enter().append "path"
        .attr "id", (d) =>
          if (d.data.participant_id.toString() == @localParticipant.toString())
            return "participantArc"

      @loadingText = @chartBody.append("text")
        .style "text-anchor", "middle"
        .attr "font-family", @fontFamily
        .attr "font-size", "15px"
        .text "Give me just a moment..."

      @text = @chartBody.append("text")
       .style "text-anchor", "middle"
       .attr "font-family", @fontFamily
       .attr "font-size", "30px"
        
      @path.transition()
        .duration(500)
        .attr "fill", @color
        .attr "d", @arc

      setTimeout(cb, 500)



    change: (data) ->
      #console.log "[pieChart] updating data: ", @data, " to: ", data
      # don't lose keys, just put them to 0
      data = @setLostKeysToZero data, @data
      # data = @setLostKeysToZero data
      console.log "[pieChart] updating data: ", @data, " to: ", data

      # keep track of previous data state
      @prevData = @data
      @data = data

      # render new arcs from new keys
      @path.data @pie(data)
        .enter().append "path"
        .attr "fill", @color
        .attr "d", @arc
        .transition()
        .duration 500
        .attrTween "d", @arcTween

      # # transition to make the update pretty
      @path.transition()
        .duration 1000
        .attrTween "d", @arcTween

      @text.text d3.format("%") @localPercentageOfTime()


    localParticipantRecord: () =>
      _.find @data, (d) => d.participant_id == window.gapi.hangout.getLocalParticipant().person.id

    # returns the number of seconds the local participant has spoken
    localSecondsSpoken: () =>
      @localParticipantRecord().seconds_spoken

    localPercentageOfTime: () =>
      localRecord = @localParticipantRecord().seconds_spoken
      totalSpoken = d3.sum(_.map(@data, (d) => d.seconds_spoken))
      #console.log "[pieChart] localRecord: ", localRecord
      #console.log "[pieChart] totalSpoken: ", totalSpoken
      return (localRecord / totalSpoken)


    # convenience function to set keys that were lost between @data and
    # data to 0, instead of removing them from the chart
    # completely. Not necessary, but can make some transitions better.
    setLostKeysToZero: (data) =>
      for item0 in @data
        found = false
        for item1 in data
          if item0.participant_id == item1.participant_id
            found = true
        if !found
          item0.seconds_spoken = 0
          data.push(item0)

      for item0 in data
        found = false
        for item1 in @data
          if item0.participant_id == item1.participant_id
            found = true
      data

    # makes sure d1 and d2 have same keys. Returns d1
    # with any keys it didn't share with d2 with zeros for values.
    setLostKeysToZero: (d1, d2) =>
      d1_keys = _.map(d1, (d) -> return d.participant_id)
      d2_keys = _.map(d2, (d) -> return d.participant_id)
      # set any that are in d2 but not in d1 to zero 
      new_keys = _.difference(d2_keys, d1_keys)
      _.each(new_keys, (p_id) => d1.push({
        'participant_id': p_id,
        'seconds_spoken': 0
        }))
      return d1


    # re-arranges data to object keyed by the @key function
    # makes it easy to reference specific arcs
    orderData: (layout) ->
      res = {}
      for obj in layout
        res[@key(obj)] = obj
      return res


    # transition function for pie chart
    arcTween: (d) =>
      # grab the old angle data from the previous data, interpolate to new
      prevData = @setLostKeysToZero @prevData, @data
      oldAngles = @orderData(@pie(@prevData))
      # problem is that oldAngles doesn't have the new / added participant ID key.
      console.log "old angles:", oldAngles
      console.log @key(d)
      console.log oldAngles[@key(d)]
      i = d3.interpolate(oldAngles[@key(d)], d)

      # function to give interpolation step for each tween step
      return (t) => @arc(i(t))


    loadData: (data) =>

      @loading = false;
      console.log "loading data..."
      
      @loadingText.transition()
        .duration(300)
        .style "opacity", 0
        .remove()

      setTimeout(() =>
        @text.text d3.format("%") @localPercentageOfTime()

        @chartBody.append("text")
          .style "text-anchor", "middle"
          .attr "x", 0
          .attr "y", -30
          .attr "font-family", @fontFamily
          .attr "font-size", "12px"
          .text "You've been speaking for"

        @chartBody.append("text")
          .style "text-anchor", "middle"
          .attr "x", 0
          .attr "y", 20
          .attr "font-family", @fontFamily
          .attr "font-size", "12px"
          .text "of this hangout."

        @change(data)
      , 500)

      
  return PieChart
