/* ------------------------------
  初期設定：変数
------------------------------ */

var index_num = 0;
var dpcdata;
var tip;



/* ------------------------------
  初期設定：ビューポート
------------------------------ */

var _width  = 750;
var _height = 400;

var margin = {top: 40, right: 40, bottom: 40, left: 40},
      g_width =  _width - margin.left - margin.right,
      g_height = _height - margin.top - margin.bottom;

var svgContainer = d3.select('#chart').append('svg')
    .attr('width', _width)
    .attr('height', _height);

var axisContainer = svgContainer.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0, 0)");

var chartContainer = svgContainer.append("g")
    .attr("class", "chart")
    .attr("transform", "translate(0, 0)");



/* ------------------------------
  初期設定：スケール＆軸
------------------------------ */

var xScale = d3.scale.linear()
    .range([margin.left, g_width + margin.right]);

var yScale = d3.scale.linear()
    .range([g_height + margin.top, margin.top]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(10);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");



/* ------------------------------
  初期設定：ナビゲーション
------------------------------ */

var xAxisOptions = ["2007年", "2008年", "2009年", "2010年", "2011年", "2012年"];

function updateMenus() {
  d3.select('#year-menu')
    .selectAll('li')
    .classed('selected', function(d) {
      return d === xAxisOptions[index_num];
    });
}

d3.select('#year-menu')
  .selectAll('li')
  .data(xAxisOptions)
  .enter()
  .append('li')
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "#000")
  .text(function(d) {return d;})
  .classed('selected', function(d) {
    return d === xAxisOptions[index_num];
  })
  .on('mouseover', function(d) {
      document.body.style.cursor = "pointer";
  })
  .on('mouseout', function(d) {
      document.body.style.cursor = "default";
  })
  .on('click', function(d) {
      updateMenus();
      index_num = xAxisOptions.indexOf(d);
      drawChart();
  });



/* ------------------------------
  外部ファイルの読み込み
------------------------------ */

queue()
    .defer(d3.json, "data/hospitals.json")
    .await(parseData);


function parseData(_error, _data) {

      dpcdata = _data;

      for (var i=0; i<xAxisOptions.length; i++){
          dpcdata.forEach(function(d) {
              d.hospital_days[i][1] = +d.hospital_days[i][1];
              d.id = +d.id;
          });
      }

    /* スケール設定 */
    xScale.domain([0, 50]); //hospital_days...在院日数
    yScale.domain([0, 900]); //patient_count

    drawTips();
    drawAxis();
    drawChart();
}




/* ------------------------------
  描画：チャート
------------------------------ */
function drawChart() {

    var circles = chartContainer.selectAll(".dot").data( dpcdata );

        circles.enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 3)
            .attr("cx", function(d) {
                      return xScale(d.hospital_days[index_num][1]);
            })
            .attr("cy", function(d) {
                      return yScale(d.patient_count[index_num][1]);
            })
            .style("fill", function(d) { return "#000"; })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);


        circles.transition()
            .duration(1000)
                .attr("cx", function(d) {
                          return xScale(d.hospital_days[index_num][1]);
                })
                .attr("cy", function(d) {
                          return yScale(d.patient_count[index_num][1]);
                })
                .attr("r", 3)
                .style("fill", "#000");

        circles.exit()
            .style('opacity', '1.0')
            .transition()
            .duration(500)
            .style('opacity', '0.0')
            .remove();
};



/* ------------------------------
  描画：軸
------------------------------ */
function drawAxis() {

      var xaxisdraw = axisContainer.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0, " + (margin.top + g_height) + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "axis-label")
          .attr("x", g_width + margin.right)
          .attr("y", -10)
          .style("text-anchor", "end")
          .attr("font-family", "sans-serif")
          .attr("font-size", "12px")
          .attr("fill", "#000")
          .text("平均在院日数");

      var yaxisdraw = axisContainer.append("g")
          .attr("class", "y-axis")
          .attr("transform", "translate("+ margin.left + ", 0)")
          .call(yAxis)
        .append("text")
          .attr("class", "axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -1 * margin.top)
          .attr("y", 10)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .attr("font-family", "sans-serif")
          .attr("font-size", "12px")
          .attr("fill", "#000")
          .text("患者数");
};



/* ------------------------------
  描画：ツールチップ
------------------------------ */
function drawTips() {

    tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<span style='color:white'>" + d.name + ": " + d.hospital_days[index_num][1] + "日／" + d.patient_count[index_num][1] + "人" + "</span>";
      });
    svgContainer.call(tip);
};
