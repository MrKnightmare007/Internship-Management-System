import React, { useState, useEffect } from 'react';
import styles from './AdminAnalytics.module.css';
import Card from './ui/Card';
import Loader from './ui/Loader';
import api from '../api';

// Advanced Chart Components
const LineChart = ({ data, title, xLabel, yLabel }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue || 1;

    return (
        <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>{title}</h4>
            <div className={styles.lineChart}>
                <div className={styles.yAxis}>
                    <span>{maxValue}</span>
                    <span>{Math.round((maxValue + minValue) / 2)}</span>
                    <span>{minValue}</span>
                </div>
                <div className={styles.chartArea}>
                    <svg className={styles.lineSvg} viewBox="0 0 400 200">
                        <polyline
                            points={data.map((item, index) =>
                                `${(index / (data.length - 1)) * 380 + 10},${190 - ((item.value - minValue) / range) * 180}`
                            ).join(' ')}
                            className={styles.line}
                        />
                        {data.map((item, index) => (
                            <circle
                                key={index}
                                cx={(index / (data.length - 1)) * 380 + 10}
                                cy={190 - ((item.value - minValue) / range) * 180}
                                r="4"
                                className={styles.dot}
                            />
                        ))}
                    </svg>
                    <div className={styles.xAxis}>
                        {data.map((item, index) => (
                            <span key={index}>{item.label}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DonutChart = ({ data, title, centerText }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
        <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>{title}</h4>
            <div className={styles.donutChart}>
                <div className={styles.donutContainer}>
                    <svg className={styles.donutSvg} viewBox="0 0 200 200">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;

                            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180);

                            const largeArcFlag = percentage > 50 ? 1 : 0;

                            const x1 = 100 + 70 * Math.cos(startAngleRad);
                            const y1 = 100 + 70 * Math.sin(startAngleRad);
                            const x2 = 100 + 70 * Math.cos(endAngleRad);
                            const y2 = 100 + 70 * Math.sin(endAngleRad);

                            const pathData = [
                                `M 100 100`,
                                `L ${x1} ${y1}`,
                                `A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z'
                            ].join(' ');

                            cumulativePercentage += percentage;

                            return (
                                <path
                                    key={index}
                                    d={pathData}
                                    fill={item.color}
                                    className={styles.donutSlice}
                                />
                            );
                        })}
                        <circle cx="100" cy="100" r="40" fill="white" />
                    </svg>
                    <div className={styles.donutCenter}>
                        <div className={styles.centerValue}>{centerText}</div>
                    </div>
                </div>
                <div className={styles.donutLegend}>
                    {data.map((item, index) => (
                        <div key={index} className={styles.legendItem}>
                            <div
                                className={styles.legendColor}
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span>{item.label}</span>
                            <span className={styles.legendValue}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HeatMap = ({ data, title }) => {
    const maxValue = Math.max(...data.flat().map(cell => cell.value));

    return (
        <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>{title}</h4>
            <div className={styles.heatMap}>
                {data.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles.heatMapRow}>
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={styles.heatMapCell}
                                style={{
                                    backgroundColor: `rgba(52, 152, 219, ${cell.value / maxValue})`,
                                    color: cell.value / maxValue > 0.5 ? 'white' : 'black'
                                }}
                                title={`${cell.label}: ${cell.value}`}
                            >
                                <div className={styles.cellLabel}>{cell.label}</div>
                                <div className={styles.cellValue}>{cell.value}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, subtitle, trend, icon, color }) => (
    <Card className={styles.metricCard}>
        <div className={styles.metricHeader}>
            <div className={styles.metricIcon} style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className={styles.metricTrend}>
                <span className={`${styles.trendIndicator} ${trend > 0 ? styles.up : styles.down}`}>
                    {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                </span>
            </div>
        </div>
        <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>{title}</h3>
            <div className={styles.metricValue}>{value}</div>
            <div className={styles.metricSubtitle}>{subtitle}</div>
        </div>
    </Card>
);

const AdminAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [detailedAnalytics, setDetailedAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('6months');

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedTimeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);
            const [dashboardResponse, detailedResponse] = await Promise.all([
                api.get('/admin/dashboard-analytics'),
                api.get(`/admin/detailed-analytics?timeRange=${selectedTimeRange}`)
            ]);

            setAnalyticsData(dashboardResponse.data);
            setDetailedAnalytics(detailedResponse.data);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Analytics data fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!analyticsData || !detailedAnalytics) return <div className={styles.error}>No data available</div>;

    return (
        <div className={styles.analytics}>
            <div className={styles.analyticsHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Advanced Analytics</h1>
                    <p className={styles.subtitle}>Deep insights into system performance and trends</p>
                </div>
                <div className={styles.timeRangeSelector}>
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className={styles.timeSelect}
                    >
                        <option value="1month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className={styles.kpiGrid}>
                <MetricCard
                    title="System Efficiency"
                    value="94.2%"
                    subtitle="Overall performance score"
                    trend={5.3}
                    icon="⚡"
                    color="#3498db"
                />
                <MetricCard
                    title="User Satisfaction"
                    value="4.7/5"
                    subtitle="Average rating"
                    trend={8.1}
                    icon="⭐"
                    color="#f39c12"
                />
                <MetricCard
                    title="Completion Rate"
                    value="87.5%"
                    subtitle="Programs completed"
                    trend={-2.1}
                    icon="✅"
                    color="#2ecc71"
                />
                <MetricCard
                    title="Growth Rate"
                    value="23.4%"
                    subtitle="Month over month"
                    trend={12.7}
                    icon="📈"
                    color="#e74c3c"
                />
            </div>

            {/* Advanced Charts Section */}
            <div className={styles.chartsSection}>
                <div className={styles.chartsGrid}>
                    <Card className={styles.chartCard}>
                        <LineChart
                            data={detailedAnalytics.programTrends}
                            title="Program Creation Trends"
                            xLabel="Month"
                            yLabel="Programs"
                        />
                    </Card>

                    <Card className={styles.chartCard}>
                        <DonutChart
                            data={[
                                { label: 'Active', value: analyticsData.programStats.active, color: '#2ecc71' },
                                { label: 'Draft', value: analyticsData.programStats.draft, color: '#f39c12' },
                                { label: 'Closed', value: analyticsData.programStats.closed, color: '#e74c3c' }
                            ]}
                            title="Program Status Distribution"
                            centerText={`${analyticsData.totalStats.totalPrograms} Total`}
                        />
                    </Card>

                    <Card className={styles.chartCard}>
                        <LineChart
                            data={detailedAnalytics.userGrowth}
                            title="User Registration Growth"
                            xLabel="Month"
                            yLabel="New Users"
                        />
                    </Card>
                </div>

                {/* Heat Map Section */}
                <Card className={styles.fullWidthCard}>
                    <HeatMap
                        data={detailedAnalytics.organizationActivity}
                        title="Organization Activity Heat Map"
                    />
                </Card>
            </div>

            {/* Detailed Analytics Tables */}
            <div className={styles.tablesSection}>
                <Card className={styles.tableCard}>
                    <h3 className={styles.cardTitle}>Performance Breakdown</h3>
                    <div className={styles.performanceGrid}>
                        <div className={styles.performanceItem}>
                            <div className={styles.performanceLabel}>Average Program Duration</div>
                            <div className={styles.performanceValue}>12.3 weeks</div>
                            <div className={styles.performanceChange}>+2.1 weeks</div>
                        </div>
                        <div className={styles.performanceItem}>
                            <div className={styles.performanceLabel}>Application Success Rate</div>
                            <div className={styles.performanceValue}>68.4%</div>
                            <div className={styles.performanceChange}>+5.2%</div>
                        </div>
                        <div className={styles.performanceItem}>
                            <div className={styles.performanceLabel}>Average Response Time</div>
                            <div className={styles.performanceValue}>2.1 days</div>
                            <div className={styles.performanceChange}>-0.3 days</div>
                        </div>
                        <div className={styles.performanceItem}>
                            <div className={styles.performanceLabel}>System Uptime</div>
                            <div className={styles.performanceValue}>99.8%</div>
                            <div className={styles.performanceChange}>+0.1%</div>
                        </div>
                    </div>
                </Card>

                <Card className={styles.tableCard}>
                    <h3 className={styles.cardTitle}>Top Performing Organizations</h3>
                    <div className={styles.rankingTable}>
                        {detailedAnalytics.topPerformers.map((org, index) => (
                            <div key={index} className={styles.rankingRow}>
                                <div className={styles.rank}>#{index + 1}</div>
                                <div className={styles.orgInfo}>
                                    <div className={styles.orgName}>{org.name}</div>
                                    <div className={styles.orgStats}>
                                        {org.programCount} programs • {org.successRate}% success rate
                                    </div>
                                </div>
                                <div className={styles.scoreContainer}>
                                    <div className={styles.score}>{org.score}</div>
                                    <div className={styles.scoreBar}>
                                        <div
                                            className={styles.scoreBarFill}
                                            style={{ width: `${org.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Insights and Recommendations */}
            <Card className={styles.insightsCard}>
                <h3 className={styles.cardTitle}>AI-Powered Insights & Recommendations</h3>
                <div className={styles.insightsGrid}>
                    {detailedAnalytics.insights.map((insight, index) => (
                        <div key={index} className={styles.insightItem}>
                            <div className={styles.insightIcon}>{insight.icon}</div>
                            <div className={styles.insightContent}>
                                <div className={styles.insightTitle}>{insight.title}</div>
                                <div className={styles.insightDescription}>{insight.description}</div>
                                <div className={styles.insightAction}>{insight.action}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default AdminAnalytics;