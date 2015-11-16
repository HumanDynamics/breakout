class window.PieChart
  constructor: (data, width, height) ->
    
    @data = data

    @margin = {top: 10, right: 10, bottom: 10, left: 10}

    @width = width - @margin.right - @margin.left
    @height = width - @margin.top - @margin.bottom

    @radius = d3.min([@width, @height]) / 2

    @arc = d3.svg.arc()
      .innerRadius(@radius - 100)
      .outerRadius(@radius - 20)

    @pie = d3.layout.pie()
      .value (d) -> d.secondsSpoken
      .sort(null);


    render: (id="#pie-chart") =>

      @chart = d3.select id
        .append "svg"
        .attr "class", "pieChart"
        .attr "width", @width + @margin.left + @margin.right
        .attr "height", @height + @margin.top + @margin.bottom
        .append "g"
        .attr "transform", "translate(" + @margin.left + "," + @margin.top + ")"

      @chartBody = @chart.append "g"

      @path = @chartBody.selectAll "path"
        .data @pie
        .enter().append "path"
        .attr "fill", (d, i) => @color(i) # or whatever
        .attr "d", @arc
        .each (d) => @current = d

  arcTween: (a) ->
    i = d3.interpolate @current, a
    @current = i(0)
    return (t) => arc(i(t))

    
