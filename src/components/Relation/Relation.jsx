import React, {Component} from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';
import axios from 'axios';

import {Input, Button} from 'antd';
import '../../assets/style.css'
import 'echarts/lib/echarts'

export default class Relation extends Component {
    constructor(props) {
        super(props);
        this.textInput = React.createRef();
        this.state = {
            getChartOptions: {},
            nameSource: '',
            title: '',
            size: 50, // 节点大小
            listData: [],
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
            i++;
        }
    }

    setDataPhone(json, n) {
        var i = 0;
        const {listData, size} = this.state
        for (var p in json) {
            listData.push({
                x: i * 52,
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
            }).then((response) => {
                let data = response.data;
                console.log(data);
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
                }, () => {
                    const {title, mainRelationShip, phoneNum, phoneIMSI} = _this.state
                    _this.setDataPhone(phoneNum, 0);
                    _this.setDataPerson(mainRelationShip, 3);
                    _this.setLinkData(phoneNum, phoneIMSI, title);
                    let echarts_instance = _this.echarts_react.getEchartsInstance();
                    console.log(echarts_instance.getHeight());
                    console.log(echarts_instance.getOption());
                    _this.setState({
                        phoneIMSI: [],
                        phoneNum: {},
                    })

                });
            })
                .catch((error) => {
                    console.log(error);
                    _this.setState({
                        error: error
                    })
                })
        } else {
            alert('请正确填写')
        }
    }

    /**
     * @description 配置图表
     * @returns
     * @memberof EchartsRadar
     */
    getChartOptions() {
        return {
            width: 'auto',
            height: 'auto',
            title: {
                text: "",
            },
            tooltip: {
                formatter: '{b}'
            },
            backgroundColor: '#f7f7f7',
            animationDuration: 1000,
            animationEasingUpdate: 'quinticInOut',
            series: [{
                type: 'graph',
                layout: 'force',
                force: {
                    repulsion: 80,
                    gravity: 0,
                    edgeLength: 150,
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
                        opacity: 1,
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
            color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                    {offset: 0, color: '#F00'},
                    {offset: 0.5, color: '#F00'},
                    {offset: 1, color: '#F00'}
                ]
            )
        }
    };

    /**
     * @description 区域点击事件和外部显示标签点击事件
     * @param {any} param
     * @param {any} echarts
     * @memberof EchartsRadar
     */
    onChartClick = (param, echarts) => {
        this.getData(param.data.name);
        echarts.resize();
    }

    render() {
        const onEvents = {
            'click': this.onChartClick,
        }
        return (
            <div>
                <div className="container">
                    <h1>关系检索 </h1>
                    <Input size="large" style={{width: 400}} placeholder="搜索" ref={this.textInput} onPressEnter={() => {
                        this.getData(this.textInput.current.state.value)
                    }}/>&emsp;
                    <Button type="primary" size="large" onClick={() => {
                        this.getData(this.textInput.current.state.value)
                    }}>查询</Button>&emsp;
                </div>

                <ReactEcharts
                    key={Math.random() + new Date().getTime()}
                    option={this.getChartOptions()}
                    onEvents={onEvents}
                    notMerge={true}
                    ref={(e) => {
                        this.echarts_react = e;
                    }}
                    lazyUpdate={true}
                    id='echart-Line'
                    style={{height: '720px'}}
                />
            </div>
        )
    }
}