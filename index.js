// Import stylesheets
import './style.css';
import { uid } from './uid';
import * as d3 from 'd3';

const width = 954;
const height = 954;
const margin = 10;
const area = d3
  .areaRadial()
  .curve(d3.curveLinearClosed)
  .angle((d) => x(d.date));
const innerRadius = width / 5;
const outerRadius = width / 2 - margin;
const line = d3
  .lineRadial()
  .curve(d3.curveLinearClosed)
  .angle((d) => x(d.date));
const rawdata = [
  { DATE: new Date('1999-01-01'), TAVG: 49, TMAX: 58, TMIN: 39 },
  { DATE: new Date('1999-01-02'), TAVG: 49, TMAX: 59, TMIN: 38 },
  { DATE: new Date('1999-01-03'), TAVG: 55, TMAX: 62, TMIN: 47 },
];

const data = Array.from(
  d3
    .rollup(
      rawdata,
      (v) => ({
        date: new Date(
          Date.UTC(2000, v[0].DATE.getUTCMonth(), v[0].DATE.getUTCDate())
        ),
        avg: d3.mean(v, (d) => d.TAVG || NaN),
        min: d3.mean(v, (d) => d.TMIN || NaN),
        max: d3.mean(v, (d) => d.TMAX || NaN),
        minmin: d3.min(v, (d) => d.TMIN || NaN),
        maxmax: d3.max(v, (d) => d.TMAX || NaN),
      }),
      (d) => `${d.DATE.getUTCMonth()}-${d.DATE.getUTCDate()}`
    )
    .values()
).sort((a, b) => d3.ascending(a.date, b.date));

const yAxis = (g) =>
  g
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .call((g) =>
      g
        .selectAll('g')
        .data(yTicks.reverse())
        .join('g')
        .attr('fill', 'none')
        .call((g) =>
          g
            .append('circle')
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.2)
            .attr('r', y)
        )
        .call((g) =>
          g
            .append('text')
            .attr('y', (d) => -y(d))
            .attr('dy', '0.35em')
            .attr('stroke', '#fff')
            .attr('stroke-width', 5)
            .text((x, i) => `${x.toFixed(0)}${i ? '' : '°F'}`)
            .clone(true)
            .attr('y', (d) => y(d))
            .selectAll(function () {
              return [this, this.previousSibling];
            })
            .clone(true)
            .attr('fill', 'currentColor')
            .attr('stroke', 'none')
        )
    );
const y = d3
  .scaleLinear()
  .domain([d3.min(data, (d) => d.minmin), d3.max(data, (d) => d.maxmax)])
  .range([innerRadius, outerRadius]);
const files = [
  { id: 'flare.analytics.graph.MaxFlowMinCut', value: 7840 },
  { id: 'flare.analytics.graph.ShortestPaths', value: 5914 },
  { id: 'flare.analytics.graph.SpanningTree', value: 3416 },
];

const yTicks = y.ticks(2);
const yTickValues = yTicks.map(y);
const circleRadius = -(yTickValues[0] - yTickValues[1]) / 2;
const firstRingMid = (yTickValues[0] + yTickValues[1]) / 2;
console.log('firstRingMid', firstRingMid);
console.log('circleRadius', circleRadius);
const minRadius = 10;
const circleRadiusScale = d3
  .scaleLinear()
  .domain([d3.min(files, (d) => d.value), d3.max(files, (d) => d.value)])
  .range([minRadius, circleRadius]);
console.log(
  '!!!!!!!!!files',
  files.map((d) => circleRadiusScale(d.value))
);

const color = d3.scaleOrdinal(d3.schemeTableau10);

files.forEach((f) => {
  f.r = circleRadiusScale(f.value);
  console.log('radius is ', f.r);
  // f.angle = 2 * Math.PI;
  f.angle = getArcCircleAngle(firstRingMid, f.r);
  console.log('angle is', f.angle);
});
const spaceBetweenCircles =
  (2 * Math.PI - d3.sum(files, (d) => d.angle)) / files.length;
console.log('space between circles', spaceBetweenCircles);
files.reduce((acc, f) => {
  const startPoint = acc + spaceBetweenCircles;
  f.angleFinal = startPoint + f.angle / 2;
  return startPoint + f.angle;
}, 0);
console.log(
  'final angle',
  files.map((f) => f.angleFinal)
);
function getArcCircleAngle(mainRadius, innerCircleRadius) {
  console.log(Math.pow(innerCircleRadius, 2));
  console.log(2 * mainRadius);
  let distanceToCutline = Math.pow(innerCircleRadius, 2) / (2 * mainRadius);
  console.log(distanceToCutline);
  distanceToCutline = mainRadius - distanceToCutline;
  console.log(distanceToCutline);
  return Math.acos(distanceToCutline / mainRadius) * 2;
}

console.log('yTicks', yTicks);
console.log('yTicks value', yTicks.map(y));
console.log('innerRadius', innerRadius);
console.log('outerRadius', outerRadius);
console.log('circleRadius', circleRadius);

function radialAreaChart() {
  const svg = d3
    .create('svg')
    // .create('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');

  // svg
  //   .append('path')
  //   .attr('fill', 'lightsteelblue')
  //   .attr('fill-opacity', 0.2)
  //   .attr(
  //     'd',
  //     area.innerRadius((d) => y(d.minmin)).outerRadius((d) => y(d.maxmax))(data)
  //   );

  // svg
  //   .append('path')
  //   .attr('fill', 'steelblue')
  //   .attr('fill-opacity', 0.2)
  //   .attr(
  //     'd',
  //     area.innerRadius((d) => y(d.min)).outerRadius((d) => y(d.max))(data)
  //   );

  svg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5);
  // .attr('d', line.radius((d) => y(d.avg))(data));

  svg.append('g').call(yAxis);

  // return svg.node();
  return svg;
}
function addCircles(svg) {
  const colors = d3.schemeTableau10;
  const x = d3
    .scaleUtc()
    .domain([Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1) - 1])
    .range([0, 2 * Math.PI]);
  const ticks = x.ticks(3);
  console.log('!!!!!!ticks', ticks);
  svg
    .selectAll('g.sorted')
    .data(files)
    .join('g')
    .attr(
      'transform',
      (d) => `translate(${d.x - width / 2},${d.y - height / 2})`
    )
    .attr('class', 'sorted')
    .append('circle')
    .attr('stroke', '2px')
    .attr('fill', (d) => color(d))
    .attr('cx', (d, i) => {
      console.log(d.angleFinal);
      return d3.pointRadial(d.angleFinal, firstRingMid)[0];
    })
    .attr('cy', (d, i) => d3.pointRadial(d.angleFinal, firstRingMid)[1])
    .attr('r', (d) => circleRadiusScale(d.value));
}

const sum = d3.sum(files, (d) => d.value);
console.log(files.map((f) => f.value));
console.log(`sum ${sum}`);
const angleRange = d3
  .scaleLinear()
  .domain([0, sum])
  .range([0, 2 * Math.PI]);
const svg = radialAreaChart();
addCircles(svg, files);

const element = document.querySelector('div#chart');
element.appendChild(svg.node());
