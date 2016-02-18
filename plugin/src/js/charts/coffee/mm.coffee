# Data given to MM viz:
# {'participants': [<participantId, participantId, ...],
#  'transitions': <Number Of transitions in interval>,
#  'turns': [{'participant_id': <participantId>,
#             'turns': <Percent of turns in interval by this participant>}, ...]

define ['d3', 'underscore'], (d3, underscore) ->
  class MM
    constructor: (data, width, height) ->

      console.log "constructing MM with data:", data

      @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"
      @margin = {top: 0, right: 0, bottom: 0, left: 0}
      @width = width - @margin.right - @margin.left
      @height = height - @margin.bottom - @margin.top

      # radius of network as a whole
      @radius = 115

      @data = data
      console.log @data

      # determines positions for participant avatars
      @angle = d3.scale.ordinal()
        .domain @data.participants
        .rangePoints [0, 360], 1

      # determines thickness of lines to ball
      @linkStrokeScale = d3.scale.linear()
        .domain [0, 1]
        .range [3, 15]

      @sphereColorScale = d3.scale.linear()
        .domain [0, data.participants.length * 5]
        .range ['#D3D3D3', '#27ae60']

      @nodeColorScale = d3.scale.ordinal()
        .domain (p for p in @data.participants)
        .range ['#AC78D0', '#EA3134', '#356AD5', '#4ECDC4', '#F89406']

      # create node data
      @nodes = ({'participant_id': p} for p in @data.participants)
      @nodes.push({'participant_id': 'energy'}) # keep the energy ball in the list of nodes

      @createLinks()
      
    nodeRadius: (d) =>
      if (d.participant_id == "energy")
        30
      else
        20


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

      @outline = @chartBody.append "g"
        .attr "id", "outline"
        .append "circle"
        .style "stroke", "#AFAFAF"
        .attr "stroke-width", 3
        .style "stroke-dasharray", ("10, 5")
        .attr "fill", "transparent"
        .attr "r", @radius + 20 + 2# + @nodeRadius + 2.5

      @linksG = @chartBody.append "g"
        .attr "id", "links"

      @nodesG = @chartBody.append "g"
        .attr "id", "nodes"

      @renderNodes()
      @renderLinks()


    renderNodes: () =>
      @node = @nodesG.selectAll "circle.node"
        .data @nodes, (d) -> d.participant_id

      @node.enter()
        .append "circle"
        .attr "class", "node"
        .attr "id", (d) -> d.participant_id
        .attr "fill", @nodeColor
        .attr 
        
      @node
        .transition()
        .duration(500)
        .attr "fill", @nodeColor
        .attr "transform", @nodeTransform
        .attr "r", @nodeRadius
        
      # remove nodes that have left
      @node.exit().remove()

    nodeColor: (d) =>
      if (d.participant_id == 'energy')
        console.log("transitions:", @data.transitions)
        return @sphereColorScale(@data.transitions)
      else
        return @nodeColorScale(d.participant_id)

    nodeTransform: (d) =>
      if (d.participant_id == "energy")
        @sphereTranslation()
      else
        "rotate(" + @angle(d.participant_id) + ")translate(" + @radius + ",0)"

    getNodeCoords: (id) =>
      transformText = @nodeTransform({'participant_id': id})
      coords = d3.transform(transformText).translate
      return {'x': coords[0], 'y': coords[1]}


    renderLinks: () =>

      @link = @linksG.selectAll "line.link"
        .data @links

      @link.enter()
        .append "line"
        .attr "class", "link"
        .attr "stroke", "#646464"
        .attr "fill", "none"
        .attr "stroke-opacity", 0.8
        .attr "stroke-width", 0

      @link.transition().duration(500)
        .attr "stroke-width", (d) => @linkStrokeScale d.weight
        .attr "x1", (d) => @getNodeCoords(d.source)['x']
        .attr "y1", (d) => @getNodeCoords(d.source)['y']
        .attr "x2", (d) => @getNodeCoords(d.target)['x']
        .attr "y2", (d) => @getNodeCoords(d.target)['y']
        
      @link.exit().remove()

    
    sphereTranslation: () =>
      x = 0
      y = 0

      for turn in @data.turns
        if _.has(@data.participants, turn.participant_id)
          coords = @getNodeCoords(turn.participant_id)
          # get coordinates of this node & distance from ball
          node_x = coords['x']
          node_y = coords['y']
          xDist = (node_x - x)
          yDist = (node_y - y)
        
          # transform x and y proportional to the percentage of turns
          # (and use dist/2 to prevent collision)
          x += turn.turns * (xDist / 2)
          y += turn.turns * (yDist / 2)
        return "translate(" + x + "," + y + ")"

    # create links, give it a 0 default (all nodes should be linked to
    # ball)
    createLinks: () =>
      @links = ({'source': turn.participant_id, 'target': 'energy', 'weight': turn.turns} for turn in @data.turns)
      for participant_id in @data.participants
        if !_.find(@links, (link) => link.source == participant_id)
          @links.push({'source': participant_id, 'target': 'energy', 'weight': 0})
      

    updateData: (data) =>
      console.log "updating MM viz with data:", data
      @data = data
      @nodes = ({'participant_id': p} for p in @data.participants)
      @nodes.push({'participant_id': 'energy'}) # keep the energy ball in the list of nodes

      @createLinks()

      # update node angle stuff
      @angle.domain @data.participants

      @renderNodes()
      @renderLinks()
