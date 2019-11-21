import React, { Component } from 'react';
import * as d3 from 'd3';


export class GraphArea extends Component <{sectorLength:number,topics:any,sectors:any, data:any},{margin:any,wid: number,height: number,barWid:number,hght:number,barHght:number,topics: any,value: any,sectorColor: any}> {
  public sectorIndx:number = 0
  public dataLen:number = 10
  constructor(props:any){  
    super(props)
    this.state = {   
      wid: window.innerWidth, 
      height: window.innerHeight - 250,
      barWid:2, 
      hght:100,
      barHght:20,
      margin:{left:400, right:250, top: 150, bottom:50},
      topics: this.props.topics,
      value: ['Completely  disagree','Somewhat disagree','Neither agree or disagree','Somewhat agree','Completely  agree'],
      sectorColor: ['#EC46464','#FF885D','#00C89C','#EBBB1B','#1664FF'],

    }  
    this.heightScale = this.heightScale.bind(this);
    this.widthScale = this.widthScale.bind(this);
    this.radiusScale = this.radiusScale.bind(this);
    this.updateData = this.updateData.bind(this);  
    this.solve = this.solve.bind(this); 
    this.changeDimensions = this.changeDimensions.bind(this);  
    window.onresize = this.changeDimensions;
  } 
  
  changeDimensions(){
    let width = window.innerWidth;
    let height = window.innerHeight -250
    this.setState({
      wid: width, 
      height: height,
    })
  };
  heightScale(value:number){
    let y = d3.scaleLinear()
      .domain([5,1]) // unit: km
      .range([this.state.margin.top, this.state.height - this.state.margin.top  - this.state.margin.bottom ]) // unit: pixels
    return y(value)
  }
  radiusScale(value:number){
    let y = d3.scaleLinear()
      .domain([0,this.dataLen]) // unit: km
      .range([0, this.state.barHght ]) // unit: pixels
    return y(value)
  }
  widthScale(value:string){
    let x = d3.scaleBand()
      .domain(this.state.topics)
      .range([this.state.margin.left, this.state.wid - 200])
      .paddingInner(0.05)
    let xvalue = x(value) 
    if(xvalue)
      xvalue = xvalue + 100
    return xvalue
  }
  solve(data:any, k:number) {

    if (k == null) k = 1;
    
    var size = data.length;
    var last = size - 4;    
  
    var path = "M" + [data[0], data[1]];
  
    for (var i = 0; i < size - 2; i +=2) {
  
      var x0 = i ? data[i - 2] : data[0];
      var y0 = i ? data[i - 1] : data[1];
  
      var x1 = data[i + 0];
      var y1 = data[i + 1];
  
      var x2 = data[i + 2];
      var y2 = data[i + 3];
  
      var x3 = i !== last ? data[i + 4] : x2;
      var y3 = i !== last ? data[i + 5] : y2;
      
      var cp1x = x1 + (x2 - x0) / 6 * k;
      var cp1y = y1 + (y2 - y0) / 6 * k;
  
      var cp2x = x2 - (x3 - x1) / 6 * k;
      var cp2y = y2 - (y3 - y1) / 6 * k;
     
      path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    } 
  
    return path;
  }
  componentDidMount(){
    setInterval(() => {this.updateData()}, 3000);
  }
  updateData() {
    this.sectorIndx++;

    if(this.props.data.length !== 0) {
      let sect  = this.props.sectors[this.sectorIndx % this.props.sectorLength]
      if(sect === 'All')
        d3.selectAll('.sectorName')
          .html('Everbody')
      else 
        d3.selectAll('.sectorName')
          .html(`${sect} industry`)
          let avgPts:any = []
      this.state.topics.forEach((el:string,j:number) => {
        let xPos = this.widthScale(el);
        let yPos  = this.heightScale( this.props.data[sect]['avg'][el] );
        d3.selectAll(`.avgCircle_${j}`)
          .transition()
          .duration(300)
          .attr('cy',yPos)
        avgPts.push(xPos,yPos)
      })

      this.state.topics.forEach((el:string,i:number) => {
        this.props.data[sect]['frequency'][el].forEach((d:any,j:number) => {

          d3.selectAll(`.topic_${i}_value_${d['key']}`)
            .transition()
            .duration(300)
            .attr('r',() => {
              return this.radiusScale(d['value'])
            })
        })
      })
      d3.selectAll('.polyLines')
        .transition()
        .duration(150)
        .attr('opacity',0)
      if(sect === 'All')
        d3.selectAll(`.polyLines`)
          .transition()
          .delay(150)
          .attr('opacity',0.8)
      else
        d3.selectAll(`.sector_${sect.replace(/[^A-Z0-9]+/ig, "_")}`)
          .transition()
          .delay(150)
          .attr('opacity',0.8)
      d3.selectAll('.avgLine')
        .transition()
        .duration(300)
        .attr('d',this.solve(avgPts,1))
    }
  }
  render(){ 
    if(this.props.data === 0)
      return <div />
    else {
        let topics_label_1 = ["Take it personally","Have a clear strategy","Find problems worth","Build & participate","Have cross-functional"];
        let topics_label_2 = ["","","solving","in ecosystems","teams"]
      let txt = this.state.topics.map((d:string,i:number) => {
        return (
          <text 
            key={i}
            className='headerText'
            x={this.widthScale(d)}
            y={50}  
            textAnchor={'middle'}
          >
            {topics_label_1[i]}
          </text>
        )

      })
      let txt1 = this.state.topics.map((d:string,i:number) => {
        return (
          <text 
            key={i}
            className='headerText'
            x={this.widthScale(d)}
            y={75}  
            textAnchor={'middle'}
          >
            {topics_label_2[i]}
          </text>
        )

      })
      
      let labelTxt = this.state.value.map((d:string,i:number) => {
        return (
          <text 
            key={i}
            className='labelText'
            x={this.state.margin.left}
            y={this.heightScale(i + 1)}
            textAnchor={'end'}  
          >
            {d}
          </text>
        )

      })
      let opacityScale = 0.65 / this.props.data[this.props.sectors[0]]['data'].length
      console.log(this.props.data)
      let polyLines = this.props.data[this.props.sectors[0]]['data'].map((d:any,i:number) => {
        let points:any = []
        this.state.topics.forEach((el:string,j:number) => {
          let xPos = this.widthScale(el);
          let yPos  = this.heightScale( d[el] );
          points.push(xPos,yPos)
        })
        console.log(d)
        return (
        <path 
          key={i}
          d={this.solve(points, 1)}
          className={`polyLines sector_${d['Sector'].replace(/[^A-Z0-9]+/ig, "_")} sector_All`}
          sector-data = {d['Sector']}
          stroke={'white'}
          opacity={0.7 - opacityScale * i}
        />
        )
      })
      let avgPts:any = [], avgCirlces: any =[];
      this.state.topics.forEach((el:string,j:number) => {
        let xPos = this.widthScale(el);
        let yPos  = this.heightScale( this.props.data[this.props.sectors[0]]['avg'][el] );
        avgCirlces.push(<circle key={j} className={`avgCircle_${j}`} r={5} cx={xPos} cy={yPos} fill={'#fb8793'} />)
        avgPts.push(xPos,yPos)
      })
      let avgLine = <path 
        d={this.solve(avgPts, 1)}
        className='avgLine'
        stroke={'#fb8793'}
        fill='none'
        strokeWidth={2}
        opacity={1}
      />
      let boxes:any = []
      this.state.topics.forEach((d:string, i:number) => {
        this.props.data[this.props.sectors[0]]['frequency'][d].forEach((el:any,j:number) => {
          let hght1 = this.radiusScale(el['value'])
          boxes.push(<circle key={`topic_${i}_value_${el['key'].replace(/[^A-Z0-9]+/ig, "_")}`} className={`boxes topic_${i}_value_${el['key'].replace(/[^A-Z0-9]+/ig, "_")}`} r={hght1} cx={this.widthScale(d)} cy={this.heightScale(el['key'])} />)
        })
      })
      return (
        <div className='svgContainer'>
          <svg width={this.state.wid} height={this.state.height}>
            {txt}
            {txt1}
            {labelTxt}
            {polyLines}
            {boxes}
            {avgLine}
            {avgCirlces}
          </svg>
        </div>
      )
    }
  }  
}

export default GraphArea;