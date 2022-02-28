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

const random = d3.randomNormal(0.4, 0.3);
const files = d3.range(100).map((id) => {
  return {
    id,
    value: random(),
  };
});
// const files = [
//   { id: 'flare.analytics.graph.MaxFlowMinCut', value: 7840 },
//   { id: 'flare.analytics.graph.ShortestPaths', value: 5914 },
//   { id: 'flare.analytics.graph.SpanningTree', value: 3416 },
// ];

const yTicks = y.ticks(2);
const yTickValues = yTicks.map(y);
const circleRadius = -(yTickValues[0] - yTickValues[1]) / 2;
const firstRingMid = (yTickValues[0] + yTickValues[1]) / 2;
const firstRingEnd = yTickValues[1];
const minRadius = 10;
const circleRadiusScale = d3
  .scaleLinear()
  .domain([d3.min(files, (d) => d.value), d3.max(files, (d) => d.value)])
  .range([minRadius, circleRadius]);

const color = d3.scaleOrdinal(d3.schemeTableau10);

files.forEach((f) => {
  f.r = circleRadiusScale(f.value);
  // f.angle = 2 * Math.PI;
  f.arcAngle = getArcCircleAngle(firstRingMid, f.r);
});
files.sort((a, b) => b.arcAngle - a.arcAngle);
const firstGroup = [];
const restGroup = [];
const centerCircleRadius = 80;

function splitGroup() {
  let firstGroupArc = 0;
  for (let file of files) {
    if (firstGroupArc + file.arcAngle < 1.5 * Math.PI) {
      firstGroup.push(file);
      firstGroupArc += file.arcAngle;
    } else {
      restGroup.push(file);
    }
  }
}

splitGroup();

const firstRingCircle = { x: 0, y: 0, r: firstRingEnd };
// d3.shuffle(restGroup);
d3.packSiblings([firstRingCircle, ...restGroup]);
d3.shuffle(firstGroup);
const spaceBetweenCircles =
  (2 * Math.PI - d3.sum(firstGroup, (d) => d.arcAngle)) / firstGroup.length;
firstGroup.reduce((acc, f, i) => {
  let startPoint = 0;
  if (i === 0) {
    startPoint = 0;
    f.angle = 0;
  } else {
    startPoint = acc + spaceBetweenCircles;
    f.angle = startPoint + f.arcAngle / 2;
  }
  const position = d3.pointRadial(f.angle, firstRingMid);
  f.x = position[0];
  f.y = position[1];
  return f.angle + f.arcAngle / 2;
}, 0);
function getArcCircleAngle(mainRadius, innerCircleRadius) {
  let distanceToCutline = Math.pow(innerCircleRadius, 2) / (2 * mainRadius);

  distanceToCutline = mainRadius - distanceToCutline;

  return Math.acos(distanceToCutline / mainRadius) * 2;
}

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
  svg
    .append('g')
    .attr('class', 'coordinate')
    .append('text')
    .attr('x', 10)
    .attr('y', 0)
    .text(() => '0,0');
  // svg
  //   .append('circle')
  //   .attr('stroke', '2px')
  //   .attr('fill', (d) => color(undefined))
  //   .attr('r', centerCircleRadius);
  const leaf = svg
    .selectAll('g.firstGroup')
    .data(firstGroup)
    .join('g')
    .attr('transform', (d) => `translate(${d.x},${d.y})`)

    // .attr(
    //   'transform',
    //   (d) => `translate(${d.x - width / 2},${d.y - height / 2})`
    // )
    // .attr('transform', (d) => {
    //   const [x, y] = d3.pointRadial(d.angle, firstRingMid);
    //   return `translate(${x}, ${y})`;
    // })
    .attr('class', 'firstGroup');

  const uid = `O-${Math.random().toString(16).slice(2)}`;

  leaf
    .append('clipPath')
    .attr('id', (d) => `${uid}-clip-${d.value}`)
    .append('circle')
    .attr('r', (d) => d.r);
  leaf
    .append('circle')
    .attr('stroke', '2px')
    .attr('fill', (d) => color(d))
    .attr('r', (d) => d.r)
    .on('mouseover', function () {
      d3.select(this).attr('stroke', '#000');
    })
    .on('mouseout', function () {
      d3.select(this).attr('stroke', null);
    })
    .on(
      'click',
      (event, d) =>
        focus !== d && (zoom(event, d, leaf), event.stopPropagation())
    );

  leaf
    .append('text')
    .attr(
      'clip-path',
      (d) => `url(${new URL(`#${uid}-clip-${d.value}`, location)})`
    )
    .selectAll('tspan')
    .data((d) => {
      return [d];
    })
    .join('tspan')
    .text((d) => {
      // console.log('d is ', Math.floor(d * 100));
      return Math.floor(d.value * 100);
    });
  const link = d3
    .link(d3.curveNatural)
    .source((d) => {
      const [x, y] = d3.pointRadial(d.angle, centerCircleRadius);
      return [x - d.x, y - d.y];
    })
    .target((d) => {
      const [x, y] = d3.pointRadial(d.angle, firstRingMid - d.r);
      return [x - d.x, y - d.y];
    });
  leaf
    .append('path')
    .attr('stroke', '#000')
    .attr('stroke-opacity', 0.2)
    .attr(
      'd',
      // (d) =>
      //   `M${d3.pointRadial(d.angle, centerCircleRadius)} L${d3.pointRadial(
      //     d.angle,
      //     firstRingMid - d.r
      //   )}`
      (d) => link(d)
    );

  const restGroupLeaf = svg
    .selectAll('g.restGroup')
    .data(restGroup)
    .join('g')
    .attr('class', 'restGroup');
  restGroupLeaf
    .append('circle')
    .attr('stroke', '2px')
    .attr('fill', (d) => color(d))
    .attr('cx', (d, i) => d.x - firstRingCircle.x)
    .attr('cy', (d, i) => d.y - firstRingCircle.y)
    .attr('r', (d) => d.r);
  return {
    leaf,
  };
}

let view;
let focus = { x: 0, y: 0, r: outerRadius };
function zoomTo(v, node) {
  const k = width / v[2];

  view = v;

  // label.attr(
  //   'transform',
  //   (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
  // );
  node.attr(
    'transform',
    // (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    (d) => {
      console.log(k);
      return `translate(${(d.x + v[0]) * k},${(d.y + v[1]) * k})`;
    }
  );
  node.attr('r', (d) => d.r * k);
}

function zoom(event, d, node) {
  const focus0 = focus;

  focus = d;

  const transition = svg
    .transition()
    .duration(event.altKey ? 7500 : 750)
    .tween('zoom', (d) => {
      debugger;
      const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
      return (t) => zoomTo(i(t), node);
    });

  node
    // .filter(function (d) {
    //   return d === focus || this.style.display === 'inline';
    // })
    .transition(transition)
    .on('start', function (d) {
      if (d === focus) this.style.display = 'inline';
    })
    .on('end', function (d) {
      if (d !== focus) this.style.display = 'none';
    });
  // label
  //   .filter(function (d) {
  //     return d.parent === focus || this.style.display === 'inline';
  //   })
  //   .transition(transition)
  //   .style('fill-opacity', (d) => (d.parent === focus ? 1 : 0))
  //   .on('start', function (d) {
  //     if (d.parent === focus) this.style.display = 'inline';
  //   })
  //   .on('end', function (d) {
  //     if (d.parent !== focus) this.style.display = 'none';
  //   });
}

const svg = radialAreaChart();
const { leaf } = addCircles(svg, files);

const element = document.querySelector('div#chart');
element.appendChild(svg.node());

zoomTo([0, 0, outerRadius], leaf);
