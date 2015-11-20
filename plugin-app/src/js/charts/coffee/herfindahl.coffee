class window.Herfindahl
  constructor: (data, width, height) ->

    # sort data by timestamp
    @data = (data.sort (d) -> d.timestamp).reverse()
    console.log "[herfChart] data: ", @data

    @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"

    @margin = {top: 10, right: 30, bottom: 50, left: 0}
    @width = width - @margin.right - @margin.left
    @height = height - @margin.bottom - @margin.top

    # get the maximum amplitude of this data
    @maxAmplitude = d3.max @data, (d) -> d.h_index
    [first, ..., last] = @data

    # index for data
    @timesUpdated = 0

    @red = "#F64747"
    @blue = "#52B3D9"
    @green = "#87D37C"

    @rectHeight = 25

    @color = d3.scale.linear()
      .domain([1, 0.5, 0])
      .range([@red, @blue, @green])

    @dotRadius = 5

    # time on y axis
    @y = d3.time.scale()
      .domain [first.timestamp, last.timestamp]
      .range [0, @height]

    # amplitudes on x axis
    @x = d3.scale.linear()
      .domain([1, 0])
      .range([0, @width])

    @yAxis = d3.svg.axis()
      .scale @y
      .orient "right"
      .ticks d3.time.second, 10
      .tickSize 1
      .tickFormat d3.time.format("%H:%M:%S")

    @xAxis = d3.svg.axis()
      .scale @x
      .tickSize 0
      .tickValues([0.165, 0.5, 0.825])
      .orient "bottom"
      .tickFormat (d) ->
        if d < 0.5
          return "Good"
        else if d == 0.5
          return "Fair"
        else if d > 0.5
          return "Poor"



  renderAxes: (svg, id="#herfindahl-chart") ->
    @xAxisG = svg.append("g")
      .attr "class", "herfindahl x axis"
      .attr "id", "herfindahl-axis"
      .attr "transform", "translate(0," + (@height + 15) + ")"
      .style "fill", '#EEEEEE'
      .attr "font-family", @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"
      .call(@xAxis)

    @yAxisG = svg.append("g")
      .attr("class", "herfindahl y axis")
      .attr("id", "herfindahl-time-axis")
      .attr("transform", "translate(" + (@width + 10) + ")")
      .attr "font-family", @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"
      .classed "herfTimeAxis", true
      .style "fill", '#82858B'
      .call(@yAxis)
      .selectAll("text")
      .attr "transform", (d) -> "rotate(90)"


  render: (id="#herfindahl-chart") ->
    @chart = d3.select(id)
      .append("svg")
      .attr("class", "herfindahlChart")
      .attr("width", @width + @margin.left + @margin.right)
      .attr("height", @height + @margin.top + @margin.bottom)
      .append("g")
      .attr("transform", "translate(" + @margin.left + "," + @margin.top + ")")

    @chartBody = @chart.append("g")

    @dots = @chartBody.selectAll('.dot')
      .data(@data)
      .enter().append("circle")
      .attr "class", "dot"
      .attr "r", @dotRadius
      .attr "cy", (d) => @y d.timestamp
      .attr "cx", (d) => @x d.h_index
      .style "fill", (d) => @color d.h_index

    @renderKey()


  renderKey: () ->
    @keyLineWidth = 0.5

    @chartBody.append("rect")
      .attr "class", "color-rect"
      .attr "x", @x(1)
      .attr "y", @height + 10
      .attr "width", @width / 3
      .attr "height", @rectHeight
      .style "fill", @red

    @chartBody.append("line")
      .attr "class", "key-line"
      .attr "x1", @x(0.825)
      .attr "y1", @height + 10
      .attr "x2", @x(0.825)
      .attr "y2", 0
      .style "stroke", @red
      .style "stroke-width", @keyLineWidth
      .style "stroke-dasharray", "5, 5"

    @chartBody.append("rect")
        .attr "class", "color-rect"
        .attr "x", @x(0.66)
        .attr "y", @height + 10
        .attr "width", @width / 3
        .attr "height", @rectHeight
        .style "fill", @blue

    @chartBody.append("line")
        .attr "class", "key-line"
        .attr "x1", @x(0.5)
        .attr "y1", @height + 10
        .attr "x2", @x(0.5)
        .attr "y2", 0
        .style "stroke", @blue
        .style "stroke-width", @keyLineWidth
        .style "stroke-dasharray", "5, 5"

    @chartBody.append("rect")
        .attr "class", "color-rect"
        .attr "x", @x(0.33)
        .attr "y", @height + 10
        .attr "width", @width / 3
        .attr "height", @rectHeight
        .style "fill", @green

    @chartBody.append("line")
        .attr "class", "key-line"
        .attr "x1", @x(0.166)
        .attr "y1", @height + 10
        .attr "x2", @x(0.166)
        .attr "y2", 0
        .style "stroke", @green
        .style "stroke-width", @keyLineWidth
        .style "stroke-dasharray", "5, 5"

    @renderAxes @chart

  updateData: (newData) =>
    console.log("got new data!", newData);
    b = @data.slice()
    @data.push newData

    @timesUpdated += 1

    @dots
      .data(@data)
      .enter().append("circle")
      .attr "class", "dot"
      .attr "r", @dotRadius
      .attr "cy", (d) => @y d.timestamp
      .attr "cx", (d) => @x d.h_index
      .style "fill", (d) => @color d.h_index

    d3.select({}).transition()
      .duration 500
      .ease "linear"
      .each () =>
        console.log("data1:", @data)
        @minDate = @data[@timesUpdated].timestamp
        @maxDate = d3.max @data, (d) -> d.timestamp
        @y.domain([@minDate, @maxDate])
        console.log "domain", @y.domain()
        @yAxisG.call(@yAxis)

        @chartBody.selectAll(".dot")
          .transition()
          .attr "cy", (d) => @y d.timestamp
          .attr "cx", (d) => @x d.h_index
