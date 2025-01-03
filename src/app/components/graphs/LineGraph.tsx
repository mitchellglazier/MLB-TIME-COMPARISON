import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface LineGraphProps {
  selectedPlayers: Array<{
    playerFullName: string;
    games: Array<{ gameNumber: number; statValue: number }>;
  }>;
  bestRanges: Array<{
    playerFullName: string;
    bestRange: { start: number; end: number };
  }>;
  average: number;
  onColorUpdate?: (colorMap: { [playerName: string]: string }) => void;
  onRangeSelect?: (range: { start: number; end: number } | null) => void;
  selectedGameNumber?: number | null;
}

const LineGraph: React.FC<LineGraphProps> = ({
  selectedPlayers,
  bestRanges,
  average,
  onColorUpdate,
  onRangeSelect,
  selectedGameNumber,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const colorMapRef = useRef<{ [playerName: string]: string }>({});
  const range = useRef<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth,
          height: clientHeight || 400,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || selectedPlayers.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([1, d3.max(selectedPlayers.flatMap((p) => p.games.map((g) => g.gameNumber))) || 1])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(selectedPlayers.flatMap((p) => p.games.map((g) => g.statValue))) || 1])
      .range([height - margin.top - margin.bottom, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const newColorMap: { [playerName: string]: string } = {};
    selectedPlayers.forEach((player, index) => {
      newColorMap[player.playerFullName] = colorScale(index.toString()) as string;
    });

    if (JSON.stringify(colorMapRef.current) !== JSON.stringify(newColorMap)) {
      colorMapRef.current = newColorMap;
      if (onColorUpdate) {
        onColorUpdate(newColorMap);
      }
    }

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10));

    svg.append('g').call(d3.axisLeft(yScale));

    const highlightBestRange = (
      playerData: Array<{ gameNumber: number; statValue: number }>,
      bestRange: { start: number; end: number },
      playerColor: string
    ) => {
      const bestGames = playerData.filter(
        (g) => g.gameNumber >= bestRange.start && g.gameNumber <= bestRange.end
      );

      const line = d3
        .line<{ gameNumber: number; statValue: number }>()
        .x((d) => xScale(d.gameNumber))
        .y((d) => yScale(d.statValue))
        .curve(d3.curveMonotoneX);

      svg
        .append('path')
        .datum(bestGames)
        .attr('fill', 'none')
        .attr('stroke', playerColor)
        .attr('stroke-width', 4)
        .attr('stroke-opacity', 0.7)
        .attr('d', line);
    };

    const updateRangeHighlight = () => {
      svg.selectAll('.range-highlight').remove();
      if (range.current.start !== null && range.current.end !== null) {
        const [start, end] = [range.current.start, range.current.end].sort((a, b) => a - b);
        svg
          .append('rect')
          .attr('class', 'range-highlight')
          .attr('x', xScale(start))
          .attr('width', xScale(end) - xScale(start))
          .attr('y', 0)
          .attr('height', height - margin.top - margin.bottom)
          .attr('fill', 'rgba(200, 200, 200, 0.3)');
      }
    };

    selectedPlayers.forEach((player, index) => {
      const playerColor = colorScale(index.toString());

      const line = d3
        .line<{ gameNumber: number; statValue: number }>()
        .x((d) => xScale(d.gameNumber))
        .y((d) => yScale(d.statValue))
        .curve(d3.curveMonotoneX);

      svg
        .append('path')
        .datum(player.games)
        .attr('fill', 'none')
        .attr('stroke', playerColor)
        .attr('stroke-width', 2)
        .attr('d', line);

      const bestRange = bestRanges.find((r) => r.playerFullName === player.playerFullName);
      if (bestRange) {
        highlightBestRange(player.games, bestRange.bestRange, playerColor);
      }
    });

    if (average !== undefined) {
      svg
        .append('line')
        .attr('x1', 0)
        .attr('x2', width - margin.left - margin.right)
        .attr('y1', yScale(average))
        .attr('y2', yScale(average))
        .attr('stroke', 'lightgray')
        .attr('stroke-dasharray', '4')
        .attr('stroke-width', 1);
    }



    svg
  .append('rect')
  .attr('width', width - margin.left - margin.right)
  .attr('height', height - margin.top - margin.bottom)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mousemove', (event: any) => {
    const [mouseX] = d3.pointer(event);
    const hoveredGame = Math.round(xScale.invert(mouseX));

    svg.selectAll('.hover-line').remove();
    svg.selectAll('.hover-text').remove();

    svg
      .append('line')
      .attr('class', 'hover-line')
      .attr('x1', xScale(hoveredGame))
      .attr('x2', xScale(hoveredGame))
      .attr('y1', 0)
      .attr('y2', height - margin.top - margin.bottom)
      .attr('stroke', 'lightgray')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4');

    svg
      .append('text')
      .attr('class', 'hover-text')
      .attr('x', xScale(hoveredGame))
      .attr('y', -5) 
      .attr('text-anchor', 'middle')
      .attr('fill', 'gray')
      .attr('font-size', '12px')
      .text(`Game ${hoveredGame}`);
  })
      .on('mouseout', () => {
        svg.selectAll('.hover-line').remove();
        svg.selectAll('.hover-text').remove();
      })
      .on('click', (event: any) => {
        const [mouseX] = d3.pointer(event);
        const clickedGame = Math.round(xScale.invert(mouseX));
        if (range.current.start === null) {
          range.current.start = clickedGame;
        } else if (range.current.end === null) {
          range.current.end = clickedGame;
          if (onRangeSelect) {
            const { start, end } = range.current;
            onRangeSelect({ start: Math.min(start, end), end: Math.max(start, end) });
          }
        } else {
          range.current.start = clickedGame;
          range.current.end = null;
          if (onRangeSelect) onRangeSelect(null);
        }
        updateRangeHighlight();
      });

    updateRangeHighlight();
  }, [selectedPlayers, bestRanges, dimensions, selectedGameNumber]);

  

  return (
    <div ref={containerRef} className="w-full h-[300px]">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default LineGraph;





