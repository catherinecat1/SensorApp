import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

import worldMapData from '../assets/world.json';

const ScatterMap = ({ data }) => {
  const [options, setOptions] = useState({});

  useEffect(() => {
    echarts.registerMap('world', worldMapData);

    const scatterData = data.map(item => ({
      name: item.equipment_id,
      value: [item.longitude, item.latitude, item.value]
    }));

    const newOptions = {
      backgroundColor: '#404a59',
      title: {
        text: 'Global Sensor Data',
        left: 'center',
        textStyle: {
          color: '#fff'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `Equipment ID: ${params.name}<br/>Value: ${params.value[2]}`;
        }
      },
      visualMap: {
        min: 0,
        max: 100, 
        calculable: true,
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        },
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: 'world',
        roam: true,
        itemStyle: {
          areaColor: '#323c48',
          borderColor: '#111'
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            areaColor: '#2a333d'
          }
        }
      },
      series: [{
        name: 'Sensor Data',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: function (val) {
          return Math.max(10, Math.min(30, val[2] / 5)); 
        },
        encode: {
            value: 2
        },
        showEffectOn: 'render',
        rippleEffect: {
            brushType: 'stroke'
        },
        itemStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
        },
        emphasis: {
            scale: true
        },
        zlevel: 1,
        emphasis: {
          label: {
            show: false
          }
        }}]
    };

    setOptions(newOptions);
  }, [data]);

  return (
    <ReactECharts
      option={options}
      style={{ height: '500px', width: '100%' }}
    />
  );
};

export default ScatterMap;