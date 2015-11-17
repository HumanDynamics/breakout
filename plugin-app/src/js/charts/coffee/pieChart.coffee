class window.PieChart
  constructor: (data, width, height) ->
    
    @data = data
    @prevData = data  # to keep track of previous data step. same at first.
             
    console.log("[pieChart] data:", @data);

    @margin = {top: 10, right: 10, bottom: 10, left: 10}

    @width = width - @margin.right - @margin.left
    @height = width - @margin.top - @margin.bottom

    @radius = d3.min([@width, @height]) / 2

    @arc = d3.svg.arc()
      .innerRadius(@radius - 100)
      .outerRadius(@radius - 20)

    # key function to access arc/data identifiers
    @key = (d) -> d.data.participantId

    @pie = d3.layout.pie()
      .value (d) -> d.secondsSpoken
      .sort(null);

    # @color = (n) ->
    #   g_colors[n % g_colors.length]

    @color = (d) ->
      if (d.data.participantId == window.state.localParticipant)
        "#C51B25"
      else
        "#aaaaa"

        
  render: (id="#pie-chart") =>

    @chart = d3.select(id)
      .append "svg"
      .attr "class", "pieChart"
      .attr "width", @width + @margin.left + @margin.right
      .attr "height", @height + @margin.top + @margin.bottom
      .append "g"
      .attr "transform", "translate(" + (@width / 2) + "," + (@height / 2) + ")"

    @chartBody = @chart.append "g"

    console.log @pie(@data)

    @path = @chartBody
      .selectAll "path"
      .data @pie(@data)
      .enter().append "path"
      
    @path .transition()
      .duration(500)
      .attr "fill", @color
      .attr "d", @arc


  change: (data) ->
    console.log "[pieChart] updating data: ", @data, " to: ", data
    # don't lose keys, just put them to 0
    data = @setLostKeysToZero data
    
    # keep track of previous data state
    @prevData = @data
    @data = data

    # render new arcs from new keys
    @path.data @pie(data)
      .enter().append "path"
      .attr "fill", @color
      .attr "d", @arc
      
    # transition to make the update pretty
    @path.transition()
      .duration 750
      .attrTween "d", @arcTween


  # convenience function to set keys that were lost between @data and
  # data to 0, instead of removing them from the chart
  # completely. Not necessary, but can make some transitions better.
  setLostKeysToZero: (data) =>
    for item0 in @data
      found = false
      for item1 in data
        if item0.participantId == item1.participantId
          found = true
      if !found
        item0.secondsSpoken = 0
        data.push(item0)
    data


  # re-arranges data to object keyed by the @key function
  # makes it easy to reference specific arcs
  orderData: (layout) ->
    res = {}
    for obj in layout
      res[@key(obj)] = obj
    return res


  # transition function for pie chart
  arcTween: (d) =>
    # grab the old angle data from the previous data, interpolate to
    # new
    oldAngles = @orderData(@pie(@prevData))
    i = d3.interpolate(oldAngles[@key(d)], d)
    
    # function to give interpolation step for each tween step
    return (t) => @arc(i(t))
