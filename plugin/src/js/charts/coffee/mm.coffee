# Data given to MM viz:
# {'participants': [<participantId, participantId, ...],
#  'transitions': <Number Of transitions in interval>,
#  'turns': [{'participant_id': <participantId>,
#             'turns': <Percent of turns in interval by this participant>}, ...]

define ['d3', 'underscore'], (d3, underscore) ->
  class MM
    constructor: (data, width, height) ->

      @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"
      @margin = {top: 0, right: 0, bottom: 0, left: 0}
      @width = width - @margin.right - @margin.left
      @height = height - @margin.bottom - @margin.top

      # radius of network as a whole
      @radius = 120
      @nodeRadius = 30

      @data = data
      console.log @data

      # determines positions for participant avatars
      @angle = d3.scale.ordinal()
        .domain @data.participants
        .rangePoints [0, 360], 1

      # determines thickness of lines to ball
      @linkStrokeScale = d3.scale.linear()
        .domain [0, 100]
        .range [3, 20]

      # create node data
      @nodes = ({'uid': p} for p in @data.participants)
      @nodes.push({'uid': 'energy'}) # keep the energy ball in the list of nodes

      @links = ({'source': turn.participant_id, 'target': 'energy', 'weight': turn.turns} for turn in @data.turns)

    render: (id="#meeting-mediator") ->
      @chart = d3.select id
        .append "svg"
        .attr "class", "meeting-mediator"
        .attr "width", @width + @margin.left + @margin.right
        .attr "height", @height + @margin.top + @margin.bottom
        .append "g"
        .attr "transform", "translate(" + @width / 2 + "," + @height / 2 + ")"

      @chartBody = @chart.append "g"
        .attr "width", @width
        .attr "height", @height

      @linksG = @chartBody.append "g"
        .attr "id", "links"

      @nodesG = @chartBody.append "g"
        .attr "id", "nodes"

      @renderNodes()
      @renderLinks()


    renderNodes: () =>
      @node = @nodesG.selectAll "circle.node"
        .data @nodes, (d) -> d.uid

      @node.enter()
        .append "circle"
        .attr "class", "node"
        .attr "id", (d) -> d.uid
        .attr "fill", (d) => "#00000"  #TODO: Colors or avatar images for nodes
        .attr "transform", @nodeTransform
        .attr "r", @nodeRadius
        
      # change radius
      # @node.transition.duration(500)
      #   .attr "r", @nodeRadius
        
      # remove nodes that have left
      @node.exit().remove()

    nodeTransform: (d) =>
      if (d.uid == "energy")
        @sphereTranslation()
      else
        "rotate(" + @angle(d.uid) + ")translate(" + @radius + ",0)"


    renderLinks: () =>
      @link = @linksG.selectAll "path.link"
        .data @links, (d) -> d.source + '_' + d.target

      @link.enter()
        .append "path"
        .attr "class", "link"
        .attr "stroke", "#ddd"
        .attr "fill", "none"
        .attr "stroke-opacity", 0.8
        .transition().duration(500)
        .attr "stroke-width", (d) => @linkStrokeScale d.weight

    
    sphereTranslation: () =>
      x = 0
      y = 0

      for turn in @data.turns
        console.log("turn:", turn);
        transformText = @nodeTransform {'uid': turn.participant_id}
        coords = d3.transform(transformText).translate

        # get coordinates of this node & distance from ball
        node_x = coords[0]
        node_y = coords[1]
        xDist = (node_x - x)
        yDist = (node_y - y)
        
        # transform x and y proportional to the percentage of turns
        # (and use dist/2 to prevent collision)
        x += turn.turns * (xDist / 2)
        y += turn.turns * (yDist / 2)
      return "translate(" + x + "," + y + ")"
