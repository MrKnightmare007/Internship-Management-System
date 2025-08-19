import React, { useState, useEffect } from 'react';
import styles from './AdminDashboardHome.module.css';
import Card from './ui/Card';
import Loader from './ui/Loader';
import api from '../api';

// Simple Chart Components (we'll create these since we don't have external chart libraries)
const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>{title}</h4>
            <div className={styles.barChart}>
                {data.map((item, index) => (
                    <div key={index} className={styles.barItem}>
                        <div
                            className={styles.bar}
                            style={{
                                height: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: item.color || '#3498db'
                            }}
                        ></div>
                        <span className={styles.barLabel}>{item.label}</span>
                        <span className={styles.barValue}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>{title}</h4>
            <div className={styles.pieChart}>
                <div className={styles.pieContainer}>
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className={styles.pieSlice}
                            style={{
                                '--percentage': `${(item.value / total) * 100}%`,
                                '--color': item.color || '#3498db'
                            }}
                        ></div>
                    ))}
                </div>
                <div className={styles.pieLegend}>
                    {data.map((item, index) => (
                        <div key={index} className={styles.legendItem}>
                            <div
                                className={styles.legendColor}
                                style={{ backgroundColor: item.color || '#3498db' }}
                            ></div>
                            <span>{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, color }) => (
    <Card className={styles.statCard}>
        <div className={styles.statHeader}>
            <div className={styles.statIcon} style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className={styles.statInfo}>
                <h3 className={styles.statTitle}>{title}</h3>
                <div className={styles.statValue}>{value}</div>
                {change && (
                    <div className={`${styles.statChange} ${change > 0 ? styles.positive : styles.negative}`}>
                        {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
                    </div>
                )}
            </div>
        </div>
    </Card>
);

const AdminDashboardHome = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/admin/dashboard-analytics');
            setDashboardData(response.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard data fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!dashboardData) return <div className={styles.error}>No data available</div>;

    const {
        totalStats,
        programStats,
        userStats,
        organizationStats,
        applicationStats,
        recentActivities,
        monthlyTrends,
        topOrganizations
    } = dashboardData;

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
                <h1 className={styles.pageTitle}>Super Admin Dashboard</h1>
                <p className={styles.subtitle}>Comprehensive overview of the Internship Management System</p>
            </div>

            {/* Key Metrics Row */}
            <div className={styles.metricsGrid}>
                <StatCard
                    title="Total Programs"
                    value={totalStats.totalPrograms}
                    change={totalStats.programsGrowth}
                    icon="📊"
                    color="#3498db"
                />
                <StatCard
                    title="Active Organizations"
                    value={totalStats.activeOrganizations}
                    change={totalStats.organizationsGrowth}
                    icon="🏢"
                    color="#2ecc71"
                />
                <StatCard
                    title="Total Applications"
                    value={totalStats.totalApplications}
                    change={totalStats.applicationsGrowth}
                    icon="📝"
                    color="#e74c3c"
                />
                <StatCard
                    title="System Users"
                    value={totalStats.totalUsers}
                    change={totalStats.usersGrowth}
                    icon="👥"
                    color="#f39c12"
                />
            </div>

            {/* Charts Row */}
            <div className={styles.chartsGrid}>
                <Card className={styles.chartCard}>
                    <BarChart
                        data={[
                            { label: 'Active', value: programStats.active, color: '#2ecc71' },
                            { label: 'Draft', value: programStats.draft, color: '#f39c12' },
                            { label: 'Closed', value: programStats.closed, color: '#e74c3c' }
                        ]}
                        title="Programs by Status"
                    />
                </Card>

                <Card className={styles.chartCard}>
                    <PieChart
                        data={[
                            { label: 'Super Admins', value: userStats.superAdmins, color: '#9b59b6' },
                            { label: 'Coordinators', value: userStats.coordinators, color: '#3498db' },
                            { label: 'Applicants', value: userStats.applicants, color: '#2ecc71' }
                        ]}
                        title="User Distribution"
                    />
                </Card>

                <Card className={styles.chartCard}>
                    <BarChart
                        data={organizationStats.map((org, index) => ({
                            label: org.name.length > 10 ? org.name.substring(0, 10) + '...' : org.name,
                            value: org.programCount,
                            color: `hsl(${index * 60}, 70%, 50%)`
                        }))}
                        title="Programs by Organization"
                    />
                </Card>
            </div>

            {/* Detailed Analytics Row */}
            <div className={styles.analyticsGrid}>
                <Card className={styles.tableCard}>
                    <h3 className={styles.cardTitle}>Top Organizations</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Organization</th>
                                    <th>Programs</th>
                                    <th>Applications</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topOrganizations.map((org, index) => (
                                    <tr key={index}>
                                        <td>{org.name}</td>
                                        <td>{org.programCount}</td>
                                        <td>{org.applicationCount}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[org.status.toLowerCase()]}`}>
                                                {org.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className={styles.activityCard}>
                    <h3 className={styles.cardTitle}>Recent System Activities</h3>
                    <div className={styles.activityList}>
                        {recentActivities.map((activity, index) => (
                            <div key={index} className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    {activity.type === 'program' ? '📊' :
                                        activity.type === 'user' ? '👤' :
                                            activity.type === 'application' ? '📝' : '🔔'}
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityText}>{activity.description}</div>
                                    <div className={styles.activityTime}>{activity.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Application Statistics */}
            <div className={styles.applicationStatsGrid}>
                <Card className={styles.chartCard}>
                    <BarChart
                        data={[
                            { label: 'Pending', value: applicationStats.pending, color: '#f39c12' },
                            { label: 'Approved', value: applicationStats.approved, color: '#2ecc71' },
                            { label: 'Rejected', value: applicationStats.rejected, color: '#e74c3c' }
                        ]}
                        title="Application Status Distribution"
                    />
                </Card>

                <Card className={styles.trendCard}>
                    <h3 className={styles.cardTitle}>Monthly Trends</h3>
                    <div className={styles.trendContainer}>
                        {monthlyTrends.map((trend, index) => (
                            <div key={index} className={styles.trendItem}>
                                <div className={styles.trendMonth}>{trend.month}</div>
                                <div className={styles.trendBars}>
                                    <div className={styles.trendBar}>
                                        <span>Programs</span>
                                        <div
                                            className={styles.trendBarFill}
                                            style={{
                                                width: `${(trend.programs / Math.max(...monthlyTrends.map(t => t.programs))) * 100}%`,
                                                backgroundColor: '#3498db'
                                            }}
                                        ></div>
                                        <span>{trend.programs}</span>
                                    </div>
                                    <div className={styles.trendBar}>
                                        <span>Applications</span>
                                        <div
                                            className={styles.trendBarFill}
                                            style={{
                                                width: `${(trend.applications / Math.max(...monthlyTrends.map(t => t.applications))) * 100}%`,
                                                backgroundColor: '#2ecc71'
                                            }}
                                        ></div>
                                        <span>{trend.applications}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
export default AdminDashboardHome;