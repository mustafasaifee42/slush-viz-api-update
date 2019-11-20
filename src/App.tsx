import React from 'react';
import * as d3 from 'd3';
import data from './data.json';
import Graph from './Graph';
import './App.css';

const App: React.FC = () => {
  let topics = ["Take it personally","Have a clear strategy","Find problems worth solving","Build & participate in ecosystems","Have cross-functional teams"];
  let sectors = ['All','1','2','3','4','5']
  
  let freqData:any = {}
  let dataBySector = d3.nest()
    .key(function(d:any) { return d.Sector; })
    .entries(data);
  let sectorAvg:any ={}
  dataBySector.forEach((el:any,i:number) => {
    sectorAvg[el.key] = {'avg':{},data:el.values}
    topics.forEach((d:string, i:number) => {
      let landAvg = d3.mean(el.values, function(k:any) { return k[d]; });
      sectorAvg[el.key]['avg'][d] = landAvg
    })
  })
  sectorAvg['All'] = {'data':[],'avg':0}
  sectorAvg['All']['data'] = data 
  let avg:any = {}
  topics.forEach((d:string, i:number) => {
    freqData[d] = {
      '1':0,
      '2':0,
      '3':0,
      '4':0,
      '5':0
    }
    let landAvg = d3.mean(data, function(el:any) { return el[d]; });
    avg[d] = landAvg
  })
  sectorAvg['All']['avg'] = avg 
  sectors.forEach((d:string,i:number) => {
    let frequency:any = {};
    topics.forEach((d1:string,i:number) => {
      freqData[d1] = {
        '1':0,
        '2':0,
        '3':0,
        '4':0,
        '5':0
      }
      var expensesCount = d3.nest()
        .key(function(k:any) { return k[d1]; })
        .rollup(function(v:any) { return v.length; })
        .entries(sectorAvg[d]['data']);
        frequency[d1] = expensesCount
    })
    sectorAvg[d]['frequency'] = frequency
  })

  return (
    <div className="App">
      <div className='header'>
        <div className="heading">How AI ready is <span className={'sectorName'}>Everybody</span>?</div>
      </div>
      <div>
        <Graph
          topics= {topics}
          sectors={sectors}
          data={sectorAvg} />
      </div>
    </div>
  );
}

export default App;
