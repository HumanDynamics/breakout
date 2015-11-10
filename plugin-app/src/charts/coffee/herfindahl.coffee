class window.Herfindahl
  constructor: (hangoutId, width, height) ->
    @hangoutId = hangoutId


    # get initial data
    @conn = new Asteroid window.meteorURL, true 
    @conn.subscribe 'h_indices'
    @herfindahlCollection = @conn.getCollection 'h_indices'
    @herfindahlRQ = @herfindahlCollection.reactiveQuery({'hangout_id': hangoutId});
    @data = @herfindahlRQ.result

    console.log "initial data:", @data

    # get the most recent entry
    @newDataRQ = @herfindahlCollection.reactiveQuery({})
    @newDataRQ.on "change", () =>
      @updateData @newDataRQ.result

    @margin = {top: 0, right: 0, bottom: 40, left: 0}

    @width = width - @margin.right
    @height = height - @margin.bottom - @margin.top

    @maxAmplitude = d3.max(@data, (d) -> d.h_index)
    [first, ..., last] = @data

    @time = d3.time.scale()
      .domain [Date.now() - 30000, Date.now()]
      .range [0, @width]

    @y = d3.scale.linear()
      .domain([0, d3.max([@maxAmplitude, 1000])])
      .range([@height, 0])

    @timeAxis = d3.svg.axis()
      .scale @time
      .orient "right"
      .ticks d3.time.second, 30
      .tickSize 0
      .tickFormat d3.time.format("%H:%M:%S")

    @xAxis = d3.svg.axis()
      .scale @y
      .tickSize 0
      .ticks 2
      .orient "bottom"


  renderAxes: (svg, id="#herfindahl-chart") ->
    @xAxisG = svg.append("g")
      .attr "class", "herfindahl x axis"
      .attr "id", "herfindahl-axis"
      .attr "transform", "translate(0," + (@height + 10) + ")"
      .style "fill", '#82858B'
      .call(@xAxis)

    @yAxisG = svg.append("g")
      .attr("class", "herfindahl y axis")
      .attr("id", "herfindahl-time-axis")
      .attr("transform", "translate(" + (@width + 10) + ")")
      .style "fill", '#82858B'
      .call(@timeAxis)


  render: (id="#herfindahl-chart") ->
    @chart = d3.select(id)
      .append("svg")
      .attr("class", "herfindahlChart")
      .attr("width", @width + @margin.left + @margin.right)
      .attr("height", @height + @margin.top + @margin.bottom)
      .append("g")
      .attr("transform", "translate(" + @margin.left + "," + @margin.top + ")")

    @chartBody = @chart.append("g")
      .attr("clip-path", "url(#herfindahl-clip)")

    @clip = @chartBody.append("defs").append("svg:clipPath")
      .attr("id", "herfindahl-clip")
      .append("svg:rect")
      .attr("id", "herfindahl-clip-rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", @width)
      .attr("height", @height)

    @dots = @chartBody.selectAll('.dot')
      .data(@data)
      .enter().append("g")
      .attr "class", "dot"
      .attr "r", 3.5
      .attr "cx", (d) => @timeAxis d.timestamp
      .attr "cy", (d) => @xAxis d.h_index
      .style "fill", (d) => "#000"

    this.renderAxes @chart


  updateData: (newData) =>
    console.log("got new data!", newData);
    @data.push newData
    @data.shift()
