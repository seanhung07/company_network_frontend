import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkGraph = ({ mainCompany, companies, setSelectedCompany }) => {
  const svgRef = useRef(null);
  const [modalContent, setModalContent] = useState(null);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(800);

  useEffect(() => {
    if (mainCompany && companies.length > 0) {
      const nodesSet = new Set();
      const nodes = [];
      const links = [];

      // Add main company node
      nodes.push({ id: mainCompany.Business_Accounting_NO, name: mainCompany.Company_Name, group: 1 });
      nodesSet.add(mainCompany.Business_Accounting_NO);

      // Add other companies and their connections based on Person_Name matching main company's Responsible_Name
      companies.forEach(company => {
        if (!nodesSet.has(company.Business_Accounting_NO)) {
          nodes.push({ id: company.Business_Accounting_NO, name: company.Company_Name, group: 2 });
          nodesSet.add(company.Business_Accounting_NO);
        }

        // Check if any Person_Name in additional_data matches the main company's Responsible_Name
        const hasMatchingPersonName = company.additional_data.some(person => person.Person_Name === mainCompany.Responsible_Name);

        if (hasMatchingPersonName) {
          links.push({
            source: mainCompany.Business_Accounting_NO,
            target: company.Business_Accounting_NO,
            type: 'responsible'
          });
        }

        company.additional_data.forEach(person => {
          if (person.juristic_person_company && !nodesSet.has(person.juristic_person_company.Business_Accounting_NO)) {
            nodes.push({
              id: person.juristic_person_company.Business_Accounting_NO,
              name: person.juristic_person_company.Company_Name,
              group: 3
            });
            nodesSet.add(person.juristic_person_company.Business_Accounting_NO);
          }
          if (person.juristic_person_company) {
            links.push({
              source: company.Business_Accounting_NO,
              target: person.juristic_person_company.Business_Accounting_NO,
              type: 'default'
            });
          }
        });
      });

      const color = d3.scaleOrdinal(['default', 'responsible'], d3.schemeCategory10);

      d3.select(svgRef.current).selectAll('*').remove(); // Clear previous SVG elements

      const svg = d3.select(svgRef.current)
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .attr('width', width)
        .attr('height', height)
        .attr('style', 'max-width: 100%; height: auto; font: 12px sans-serif;');

      svg.append('defs').selectAll('marker')
        .data(['default', 'responsible'])
        .join('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', -0.5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', color)
        .attr('d', 'M0,-5L10,0L0,5');

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(300).strength(0.1))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(0, 0))
        .force('x', d3.forceX().strength(0.05))
        .force('y', d3.forceY().strength(0.05));

      const link = svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('stroke', d => color(d.type))
        .attr('marker-end', d => `url(#arrow-${d.type})`);

      const node = svg.append('g')
        .attr('fill', 'currentColor')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .call(drag(simulation))
        .on('click', (event, d) => {
          const company = companies.find(company => company.Business_Accounting_NO === d.id)
            || companies.flatMap(company => company.additional_data)
              .find(person => person.juristic_person_company && person.juristic_person_company.Business_Accounting_NO === d.id)?.juristic_person_company
            || mainCompany;
          setModalContent(company);
          console.log(company);  // Log the modal content to the console
        });

      node.append('circle')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('r', d => d.group === 1 ? 10 : d.group === 2 ? 8 : 6)
        .attr('fill', d => d.group === 1 ? '#FF4136' : d.group === 2 ? '#0074D9' : '#2ECC40');

      node.append('text')
        .attr('x', 8)
        .attr('y', '0.31em')
        .text(d => d.name)
        .clone(true).lower()
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 3);

      simulation.on('tick', () => {
        link.attr('d', linkArc);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });

      function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
          M${d.source.x},${d.source.y}
          A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
        `;
      }

      function drag(simulation) {
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
    }
  }, [mainCompany, companies, width, height, setSelectedCompany]);

  return (
    <div>
      <div style={{ marginTop: 30 }}>
        <div style={{ float: 'right' }}>
          <label>
            Width: 
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </label>
          <label>
            Height: 
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </label>
        </div>
      </div>
      <svg ref={svgRef}></svg>
      {modalContent && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalContent(null)}>&times;</span>
            <h2>{modalContent.Company_Name}</h2>
            <p>Business Accounting No: {modalContent.Business_Accounting_NO}</p>
            {modalContent.additional_data && modalContent.additional_data.length > 0 && (
              <div>
                <h3>董事資料 (Board Members):</h3>
                <ul>
                  {modalContent.additional_data.map((person, index) => (
                    <li key={index}>
                      {person.Person_Position_Name} - {person.Person_Name} - {person.Juristic_Person_Name}: {person.Person_Shareholding}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        .modal {
          display: block;
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgb(0,0,0);
          background-color: rgba(0,0,0,0.4);
        }

        .modal-content {
          background-color: #fefefe;
          margin: 15% auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
        }

        .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
        }

        .close:hover,
        .close:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default NetworkGraph;
