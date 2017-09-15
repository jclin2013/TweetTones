import {
  colorsByTitle,
  tonesTitleization,
  likelihoodLabel,
  bcOffsetCalc,
  fadeEffectBC
} from './constants';

import * as d3 from 'd3';

export class BarChartsProcessor {
  constructor() {
    this.xScaleBarCharts = d3.scaleLinear()
                            .domain([0, 1])
                            .range([0, 250]);

    this.xAxisBarCharts = d3.axisBottom(this.xScaleBarCharts);
  }

  createBarChart(data, labels, title) {
    let svg = d3.select(".barcharts-container")
                .append("svg")
                .attr("viewBox", "0 0 500 300")
                .attr("class", title + "_barchart");

    svg.append("text")
        .attr("x", 250)
        .attr("y", 42)
        .text(tonesTitleization[title])
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "25px");

    let bars = svg.selectAll("rect")
                  .data(data)
                  .enter();

    let colors = colorsByTitle(title);
    let offset = bcOffsetCalc(title);

    let yScaleBarChart = d3.scaleBand()
                           .domain(labels)
                           .range([65, 275])
                           .paddingInner(0.2);

    let yAxisBarChart = d3.axisLeft(yScaleBarChart)
                          .tickSizeOuter(0)
                          .tickSizeInner(0);

    let yAxisBarChartDOM = svg.append("g")
                              .attr("class", "y axis")
                              .attr("transform", "translate(" + (120 + offset) + ",0)")
                              .call(yAxisBarChart);

    yAxisBarChartDOM.select("path").attr("stroke", "");
    yAxisBarChartDOM.selectAll("text").attr("font-size", "14.5px");

    bars.append("rect")
        .attr("x", 125  + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]))
        .attr("width", d => this.xScaleBarCharts(d))
        .attr("height", yScaleBarChart.bandwidth())
        .attr("fill", (d, i) => colors[i])
        .attr("opacity", fadeEffectBC)
        .attr("class", "toneValueBar");

    bars.append("rect")
        .attr("x", d => 125 + this.xScaleBarCharts(d) + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]))
        .attr("width", d => 250 - this.xScaleBarCharts(d))
        .attr("height", yScaleBarChart.bandwidth())
        .attr("fill", "lightgray")
        .attr("opacity", fadeEffectBC)
        .attr("class", "emptyValueBar");

    bars.append("text")
        .attr("x", 125 + 250 + 10 + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]) + yScaleBarChart.bandwidth()/2)
        .text(d => d3.format(".2f")(d))
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("opacity", fadeEffectBC)
        .attr("class", "toneValueBarNumLabel");

    bars.append("text")
        .attr("x", 125 + 250 + 10 + offset)
        .attr("y", (d, i) => yScaleBarChart(labels[i]) + yScaleBarChart.bandwidth()/2 + 12)
        .text(likelihoodLabel)
        .attr("opacity", fadeEffectBC)
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("class", "toneLikelihoodLabel");
  }

  updateAllBarCharts(newTweet) {
    ["emotion_tone", "language_tone", "social_tone"].forEach(title => {
      let offset = bcOffsetCalc(title);
      let newData = Object.values(newTweet[title]);
      let svg = d3.select("." + title + "_barchart");

      svg.selectAll(".toneValueBar")
         .data(newData)
         .attr("opacity", fadeEffectBC)
         .transition()
         .duration(500)
         .attr("width", d => this.xScaleBarCharts(d));

      svg.selectAll(".emptyValueBar")
         .data(newData)
         .attr("opacity", fadeEffectBC)
         .transition()
         .duration(500)
         .attr("x", d => 125 + this.xScaleBarCharts(d) + offset)
         .attr("width", d => 250 - this.xScaleBarCharts(d));

      svg.selectAll(".toneValueBarNumLabel")
         .data(newData)
         .text(d => d3.format(".2f")(d))
         .attr("opacity", fadeEffectBC);

      svg.selectAll(".toneLikelihoodLabel")
          .data(newData)
          .text(likelihoodLabel)
          .attr("opacity", fadeEffectBC);
    });
  }

}