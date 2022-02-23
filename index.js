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

const xAxis = (g) =>
  g
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .call((g) =>
      g
        .selectAll('g')
        .data(x.ticks())
        .join('g')
        .each((d, i) => (d.id = uid('month')))
        .call((g) =>
          g
            .append('path')
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.2)
            .attr(
              'd',
              (d) => `
              M${d3.pointRadial(x(d), innerRadius)}
              L${d3.pointRadial(x(d), outerRadius)}
            `
            )
        )
        .call((g) =>
          g
            .append('path')
            .attr('id', (d) => d.id.id)
            .datum((d) => [d, d3.utcMonth.offset(d, 1)])
            .attr('fill', 'none')
            .attr(
              'd',
              ([a, b]) => `
              M${d3.pointRadial(x(a), innerRadius)}
              A${innerRadius},${innerRadius} 0,0,1 ${d3.pointRadial(
                x(b),
                innerRadius
              )}
            `
            )
        )
        .call((g) =>
          g
            .append('text')
            .append('textPath')
            .attr('startOffset', 6)
            .attr('xlink:href', (d) => d.id.href)
            .text(d3.utcFormat('%B'))
        )
    );

const yAxis = (g) =>
  g
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .call((g) =>
      g
        .selectAll('g')
        .data(y.ticks(2).reverse())
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
const x = d3
  .scaleUtc()
  .domain([Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1) - 1])
  .range([0, 2 * Math.PI]);
const y = d3
  .scaleLinear()
  .domain([d3.min(data, (d) => d.minmin), d3.max(data, (d) => d.maxmax)])
  .range([innerRadius, outerRadius]);

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

  svg.append('g').call(xAxis);

  svg.append('g').call(yAxis);

  return svg.node();
}
const element = document.querySelector('div#chart');
element.appendChild(radialAreaChart());
