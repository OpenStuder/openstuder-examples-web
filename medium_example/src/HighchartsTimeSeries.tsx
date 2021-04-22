import * as React from 'react';
import * as Highcharts from 'highcharts';
import {ChartObject} from 'highcharts';

// noinspection TsLint
const Boost = require('highcharts/modules/boost');
Boost(Highcharts); // WebGL-backed rendering (https://www.highcharts.com/blog/tutorials/higcharts-boost-module/)

interface HighchartsTimeSeriesProperties {
    className: string;
    backgroundColor: string;
    slidingTimeWindowSec: number
}

class HighchartsTimeSeries extends React.Component<HighchartsTimeSeriesProperties, {}> {

    public static defaultProps = {
        backgroundColor: '#FFFFFF',
        slidingTimeWindowSec: 600
    }

    private readonly renderToId = 'highcharts-container';
    // @ts-ignore
    private chart: ChartObject;

    public componentDidMount() {
        Highcharts.setOptions({
            global: {
                useUTC: false
            },
            chart: {
                backgroundColor: this.props.backgroundColor
            }
        });
        const now = Date.now();
        this.chart = Highcharts.chart(this.renderToId, {
            title: {
                text: 'Total power [kW]',
                style: {
                    color: 'rgb(84, 156, 181)',
                    fontWeight: 'bold'
                }
            },
            credits: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                min: now,
                max: now + this.props.slidingTimeWindowSec * 1000,
                lineColor: 'rgb(84, 156, 181)',
                labels: {
                    style: {
                        color: 'rgb(84, 156, 181)'
                    }
                }
            },
            yAxis: {
                title: undefined,
                min: 0,
                minRange: 0.01,
                lineWidth: 1,
                lineColor: 'rgb(84, 156, 181)',
                labels: {
                    style: {
                        color: 'rgb(84, 156, 181)'
                    }
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [
                {
                    type: 'line',
                    color: 'rgb(0, 0, 0)',
                    name: "Total power",
                    data: []
                }
            ]
        });
    }

    public render() {
        return (
            <div className={this.props.className} id={this.renderToId}/>
        );
    }

    public addPoint(value: number) {
        const now = Date.now();
        const series = this.chart.series[0];
        const animate = series.data.length !== 0;
        const firstPoint = series.data[0];
        if (firstPoint && now - firstPoint.x > this.props.slidingTimeWindowSec * 1000) {
            console.log("REMOVE");
            series.data = series.data.filter(point => now - point.x <= this.props.slidingTimeWindowSec);
            this.chart.xAxis[0].setExtremes(now - this.props.slidingTimeWindowSec * 1000, now);
        }
        series.addPoint([now, value], true, false, animate);
    }
}

export default HighchartsTimeSeries;
