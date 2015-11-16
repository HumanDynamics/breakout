class window.PieChart
  constructor: (data, width, height) ->
    
    @data = data
             
    console.log("[pieChart] data:", @data);

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

    @color = (pid) ->
      "#B2B2B2"

      
  render: (id="#pie-chart") ->
    
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
    .attr "fill", (d, i) => "#B2B2B2"
    .attr "d", @arc
    .each (d) => @current = d


  arcTween: (a) ->
    i = d3.interpolate @current, a
    @current = i(0)
    return (t) => arc(i(t))

    
