import React, {Component} from 'react';
import echarts from 'echarts'

import axios from 'axios';
import '../../assets/style.css'
import {Input, Button} from 'antd';

import 'echarts/lib/echarts'

export default class Relation extends Component {
    constructor(props) {
        super(props);
        this.myChart=React.createRef();
        this.textInput = React.createRef();
        this.state = {
            data: null,
            getChartOptions: {},
            nameSource: '',
            title: '123',
            size: 50, // 节点大小
            listData: [],
            l:150,
            links: [],
            texts: [],
            mainRelationShip: {},
            phoneNum: {},
            phoneIMSI: []
        };
    }

    setDataPerson(json, n) {
        const {listData} = this.state
        var i = 0;
        for (var p in json) {
            listData.push({
                x: 50,
                y: 100,
                "name": p,
                "showName": json[p],
                "symbolSize": 70,
                "category": n,
                "draggable": "true",
                formatter: function (params) {
                    return params.data.showName
                },
                label: {
                    position: 'inside'
                }
            });
            i=i+1;
        }
    }

    setDataPhone(json, n) {
        var i = 0;
        const {listData, size} = this.state
        for (var p in json) {
            listData.push({
                x: i * 50,
                y: size + i * 10,
                "name": p,
                "showName": json[p],

                "symbolSize": size,
                "category": n,
                "draggable": false,
                formatter: function (params) {
                    return params.data.showName
                },
                label: {
                    position: 'inside'
                }
            });
            i++;
        }
    }

    setLinkData(json, relarr, title) {
        const {links} = this.state
        if (relarr !== "") {
            var i = 0;
            for (var p in json) {
                links.push({
                    "source": p,
                    "target": title,
                    "value": relarr[i],
                    lineStyle: {
                        normal: {
                            // text: relarr[i],
                            color: 'source'
                        }
                    }
                });
                i++;
            }
        } else {
            for (var p2 in json) {
                links.push({
                    "source": p2,
                    "target": title,
                    "value": "",
                    lineStyle: {
                        normal: {
                            color: 'source'
                        }
                    }
                });
            }
        }
    }

    /**
     * @description 配置图表
     * @returns
     * @memberof EchartsRadar
     */

    async getData(value, level = 1) {
        const _this = this;
        _this.setState({
            listData: [],
            links: [],
        })
        if (value) {
            axios.get(`http://106.12.24.78:8090/graph`, {
                params: {
                    keyword: value,
                    level: 1
                }
            }).then(function (response) {
                console.log(response.data);
                let data = response.data;
                let phoneIMSIValue = [], phoneNumTarget = {}
                if (response) {
                    for (let item of data.links) {
                        phoneIMSIValue.push(item.value)
                        phoneNumTarget[item.target] = item.target
                    }
                }
                _this.setState({
                    data,
                    nameSource: value,
                    title: value,
                    mainRelationShip: {
                        [value]: value
                    },
                    phoneIMSI: phoneIMSIValue,
                    phoneNum: phoneNumTarget,
                },() => {
                    console.log(_this.myChart)
                    // _this.myChart.current.echartsElement.resize();
                    const {title, mainRelationShip, phoneNum, phoneIMSI} = _this.state
                    _this.setDataPhone(phoneNum, 0);
                    _this.setDataPerson(mainRelationShip, 3);
                    _this.setLinkData(phoneNum, phoneIMSI, title);
                    _this.setState({
                        phoneIMSI: [],
                        phoneNum: {},
                        title:'',
                    },()=>{
                        _this.getChartOptions()
                    })

                });
            })

                .catch(function (error) {
                    console.log(error);
                    _this.setState({
                        error: error
                    })
                })
        } else {
            alert('请正确填写')
        }
    }

    getChartOptions = () => {
        var myChart = echarts.init(document.getElementById('chart'));
        myChart .clear()
        myChart.setOption( {
            title: {
                text: "",
            },
            tooltip: {
                formatter: '{b}'
            },

            backgroundColor: '#fff',
            animationDuration: 1000,
            animationEasingUpdate: 'quinticInOut',

            series: [{
                type: 'graph',
                layout: 'force',
                graph:{
                    zoom:10
                },
                force: {

                    repulsion: 80,
                    gravity: 0,
                    edgeLength: this.state.listData.length*5,
                    layoutAnimation: false,
                },
                data: this.state.listData,
                links: this.state.links,
                categories: this.state.texts,
                roam: true,
                nodeScaleRatio: 0,
                focusNodeAdjacency: true,
                lineStyle: {
                    normal: {
                        opacity: 0.5,
                        width: 1.5,
                        curveness: 0
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        textStyle: {
                            color: '#FFF',
                            fontWeight: 'normal',
                            fontSize: "12" //字体大小
                        },
                        formatter: function (params) {
                            return params.data.showName
                        },
                        fontSize: 18,
                        fontStyle: '600',
                    }
                },
                edgeLabel: {
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 12
                        },
                        formatter: "{c}"
                    }
                }
            }],
            color: ['#F00', '#41b1ef', '#667aed', '#347fbb', '#772cdc',
                '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0'
            ]
        })

        const clickFun = param => {
            this.getData(param.data.name);
        }

        myChart.off("click")
        myChart.on("click", clickFun);
    };

    /**
     * @description 区域点击事件和外部显示标签点击事件
     * @param {any} param
     * @param {any} echarts
     * @memberof EchartsRadar
     */
    onChartClick = (param, echarts) => {
        echarts.resize();
        this.getData(param.data.name);

    }

    render() {

        return (
            <div className="container">
                <h1>关系检索 </h1>
                <Input size="large" style={{width: 400}} placeholder="搜索" ref={this.textInput} onPressEnter={() => {
                    this.getData(this.textInput.current.state.value)
                }}/>&emsp;
                <Button type="primary" size="large" onClick={() => {
                    this.getData(this.textInput.current.state.value)
                }}>查询</Button>&emsp;
                <div id="chart" style={{  height: 1000 }}>

                </div>
            </div>
        )
    }
}