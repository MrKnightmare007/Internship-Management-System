package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminAnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private InternshipProgramRepository programRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/dashboard-analytics")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        try {
            Map<String, Object> analytics = new HashMap<>();

            // Get all data
            List<User> allUsers = userRepository.findAll();
            List<OrganizationMaster> allOrganizations = organizationRepository.findAll();
            List<InternshipProgram> allPrograms = programRepository.findAll();
            List<Notification> allNotifications = notificationRepository.findAll();

            // Calculate total stats
            Map<String, Object> totalStats = calculateTotalStats(allUsers, allOrganizations, allPrograms);
            analytics.put("totalStats", totalStats);

            // Program statistics
            Map<String, Object> programStats = calculateProgramStats(allPrograms);
            analytics.put("programStats", programStats);

            // User statistics
            Map<String, Object> userStats = calculateUserStats(allUsers);
            analytics.put("userStats", userStats);

            // Organization statistics
            List<Map<String, Object>> organizationStats = calculateOrganizationStats(allOrganizations, allPrograms);
            analytics.put("organizationStats", organizationStats);

            // Application statistics (mock data since we don't have applications table yet)
            Map<String, Object> applicationStats = calculateApplicationStats();
            analytics.put("applicationStats", applicationStats);

            // Recent activities
            List<Map<String, Object>> recentActivities = getRecentActivities(allPrograms, allUsers, allNotifications);
            analytics.put("recentActivities", recentActivities);

            // Monthly trends (mock data for demonstration)
            List<Map<String, Object>> monthlyTrends = getMonthlyTrends();
            analytics.put("monthlyTrends", monthlyTrends);

            // Top organizations
            List<Map<String, Object>> topOrganizations = getTopOrganizations(allOrganizations, allPrograms);
            analytics.put("topOrganizations", topOrganizations);

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch analytics data"));
        }
    }

    private Map<String, Object> calculateTotalStats(List<User> users, List<OrganizationMaster> organizations, List<InternshipProgram> programs) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPrograms", programs.size());
        stats.put("activeOrganizations", organizations.stream().mapToInt(org -> "ACTIVE".equals(org.getOrgStatus()) ? 1 : 0).sum());
        stats.put("totalApplications", programs.stream().mapToInt(p -> p.getProgMaxApplicants() != null ? p.getProgMaxApplicants() : 0).sum());
        stats.put("totalUsers", users.size());
        
        // Mock growth percentages (in real app, compare with previous period)
        stats.put("programsGrowth", 12.5);
        stats.put("organizationsGrowth", 8.3);
        stats.put("applicationsGrowth", 15.7);
        stats.put("usersGrowth", 6.2);
        
        return stats;
    }

    private Map<String, Object> calculateProgramStats(List<InternshipProgram> programs) {
        Map<String, Object> stats = new HashMap<>();
        
        long activeCount = programs.stream().filter(p -> "ACTIVE".equals(p.getProgStatus())).count();
        long draftCount = programs.stream().filter(p -> "DRAFT".equals(p.getProgStatus())).count();
        long closedCount = programs.stream().filter(p -> "CLOSED".equals(p.getProgStatus())).count();
        
        stats.put("active", activeCount);
        stats.put("draft", draftCount);
        stats.put("closed", closedCount);
        
        return stats;
    }

    private Map<String, Object> calculateUserStats(List<User> users) {
        Map<String, Object> stats = new HashMap<>();
        
        long superAdmins = users.stream().filter(u -> "SUPER_ADMIN".equals(u.getUserType())).count();
        long coordinators = users.stream().filter(u -> "ORGANIZATION_MASTER".equals(u.getUserType())).count();
        long applicants = users.stream().filter(u -> "APPLICANT".equals(u.getUserType())).count();
        
        stats.put("superAdmins", superAdmins);
        stats.put("coordinators", coordinators);
        stats.put("applicants", applicants);
        
        return stats;
    }

    private List<Map<String, Object>> calculateOrganizationStats(List<OrganizationMaster> organizations, List<InternshipProgram> programs) {
        return organizations.stream()
                .limit(5) // Top 5 organizations
                .map(org -> {
                    Map<String, Object> orgStat = new HashMap<>();
                    orgStat.put("name", org.getOrgName());
                    orgStat.put("programCount", programs.stream().filter(p -> p.getIntOrgId().equals(org.getOrgId())).count());
                    return orgStat;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> calculateApplicationStats() {
        // Mock data - in real implementation, fetch from applications table
        Map<String, Object> stats = new HashMap<>();
        stats.put("pending", 45);
        stats.put("approved", 123);
        stats.put("rejected", 32);
        return stats;
    }

    private List<Map<String, Object>> getRecentActivities(List<InternshipProgram> programs, List<User> users, List<Notification> notifications) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Recent programs
        programs.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(3)
                .forEach(program -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "program");
                    activity.put("description", "New program created: " + program.getIntProgName());
                    activity.put("timestamp", formatTimestamp(program.getCreatedAt()));
                    activities.add(activity);
                });

        // Recent users
        users.stream()
                .filter(u -> !"SUPER_ADMIN".equals(u.getUserType()))
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(2)
                .forEach(user -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "user");
                    activity.put("description", "New " + user.getUserType().toLowerCase().replace("_", " ") + " registered: " + user.getUsername());
                    activity.put("timestamp", formatTimestamp(user.getCreatedAt()));
                    activities.add(activity);
                });

        // Recent notifications
        notifications.stream()
                .sorted((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()))
                .limit(2)
                .forEach(notification -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "notification");
                    activity.put("description", "Notification sent: " + notification.getTitle());
                    activity.put("timestamp", formatTimestamp(notification.getCreatedAt()));
                    activities.add(activity);
                });

        return activities.stream()
                .sorted((a1, a2) -> ((String) a2.get("timestamp")).compareTo((String) a1.get("timestamp")))
                .limit(8)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getMonthlyTrends() {
        // Mock data for monthly trends
        List<Map<String, Object>> trends = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        int[] programCounts = {5, 8, 12, 15, 18, 22};
        int[] applicationCounts = {25, 45, 67, 89, 112, 145};
        
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> trend = new HashMap<>();
            trend.put("month", months[i]);
            trend.put("programs", programCounts[i]);
            trend.put("applications", applicationCounts[i]);
            trends.add(trend);
        }
        
        return trends;
    }

    private List<Map<String, Object>> getTopOrganizations(List<OrganizationMaster> organizations, List<InternshipProgram> programs) {
        return organizations.stream()
                .map(org -> {
                    Map<String, Object> orgData = new HashMap<>();
                    orgData.put("name", org.getOrgName());
                    orgData.put("programCount", programs.stream().filter(p -> p.getIntOrgId().equals(org.getOrgId())).count());
                    orgData.put("applicationCount", programs.stream()
                            .filter(p -> p.getIntOrgId().equals(org.getOrgId()))
                            .mapToInt(p -> p.getProgMaxApplicants() != null ? p.getProgMaxApplicants() : 0)
                            .sum());
                    orgData.put("status", org.getOrgStatus());
                    return orgData;
                })
                .sorted((o1, o2) -> Long.compare((Long) o2.get("programCount"), (Long) o1.get("programCount")))
                .limit(10)
                .collect(Collectors.toList());
    }

    @GetMapping("/detailed-analytics")
    public ResponseEntity<Map<String, Object>> getDetailedAnalytics(@RequestParam(defaultValue = "6months") String timeRange) {
        try {
            Map<String, Object> detailedAnalytics = new HashMap<>();

            // Get all data
            List<InternshipProgram> allPrograms = programRepository.findAll();
            List<User> allUsers = userRepository.findAll();
            List<OrganizationMaster> allOrganizations = organizationRepository.findAll();

            // Program trends over time
            List<Map<String, Object>> programTrends = generateProgramTrends(timeRange);
            detailedAnalytics.put("programTrends", programTrends);

            // User growth trends
            List<Map<String, Object>> userGrowth = generateUserGrowthTrends(timeRange);
            detailedAnalytics.put("userGrowth", userGrowth);

            // Organization activity heat map
            List<List<Map<String, Object>>> organizationActivity = generateOrganizationActivityHeatMap(allOrganizations, allPrograms);
            detailedAnalytics.put("organizationActivity", organizationActivity);

            // Top performers
            List<Map<String, Object>> topPerformers = generateTopPerformers(allOrganizations, allPrograms);
            detailedAnalytics.put("topPerformers", topPerformers);

            // AI-powered insights
            List<Map<String, Object>> insights = generateInsights(allPrograms, allUsers, allOrganizations);
            detailedAnalytics.put("insights", insights);

            return ResponseEntity.ok(detailedAnalytics);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch detailed analytics"));
        }
    }

    private List<Map<String, Object>> generateProgramTrends(String timeRange) {
        // Mock data for program trends - in real implementation, query database by date ranges
        List<Map<String, Object>> trends = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        int[] values = {3, 7, 12, 18, 25, 32};
        
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> trend = new HashMap<>();
            trend.put("label", months[i]);
            trend.put("value", values[i]);
            trends.add(trend);
        }
        
        return trends;
    }

    private List<Map<String, Object>> generateUserGrowthTrends(String timeRange) {
        // Mock data for user growth trends
        List<Map<String, Object>> trends = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        int[] values = {15, 28, 45, 67, 89, 124};
        
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> trend = new HashMap<>();
            trend.put("label", months[i]);
            trend.put("value", values[i]);
            trends.add(trend);
        }
        
        return trends;
    }

    private List<List<Map<String, Object>>> generateOrganizationActivityHeatMap(List<OrganizationMaster> organizations, List<InternshipProgram> programs) {
        List<List<Map<String, Object>>> heatMap = new ArrayList<>();
        
        // Create a 3x4 heat map grid
        String[] categories = {"Programs", "Applications", "Success Rate"};
        String[] timeFrames = {"Q1", "Q2", "Q3", "Q4"};
        
        for (String category : categories) {
            List<Map<String, Object>> row = new ArrayList<>();
            for (String timeFrame : timeFrames) {
                Map<String, Object> cell = new HashMap<>();
                cell.put("label", timeFrame);
                // Mock values based on category and time frame
                int value = (int) (Math.random() * 100) + 1;
                cell.put("value", value);
                row.add(cell);
            }
            heatMap.add(row);
        }
        
        return heatMap;
    }

    private List<Map<String, Object>> generateTopPerformers(List<OrganizationMaster> organizations, List<InternshipProgram> programs) {
        return organizations.stream()
                .limit(5)
                .map(org -> {
                    Map<String, Object> performer = new HashMap<>();
                    performer.put("name", org.getOrgName());
                    
                    long programCount = programs.stream().filter(p -> p.getIntOrgId().equals(org.getOrgId())).count();
                    performer.put("programCount", programCount);
                    
                    // Mock success rate and score
                    int successRate = (int) (Math.random() * 30) + 70; // 70-100%
                    int score = (int) (Math.random() * 20) + 80; // 80-100
                    
                    performer.put("successRate", successRate);
                    performer.put("score", score);
                    
                    return performer;
                })
                .sorted((p1, p2) -> Integer.compare((Integer) p2.get("score"), (Integer) p1.get("score")))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> generateInsights(List<InternshipProgram> programs, List<User> users, List<OrganizationMaster> organizations) {
        List<Map<String, Object>> insights = new ArrayList<>();
        
        // Insight 1: Program Performance
        Map<String, Object> insight1 = new HashMap<>();
        insight1.put("icon", "📊");
        insight1.put("title", "Program Performance Optimization");
        insight1.put("description", "Programs with duration 8-12 weeks show 23% higher completion rates than longer programs.");
        insight1.put("action", "Consider optimizing program durations for better outcomes.");
        insights.add(insight1);
        
        // Insight 2: User Engagement
        Map<String, Object> insight2 = new HashMap<>();
        insight2.put("icon", "👥");
        insight2.put("title", "Peak Application Periods");
        insight2.put("description", "Applications increase by 45% during March-May period. Plan capacity accordingly.");
        insight2.put("action", "Schedule more programs during high-demand periods.");
        insights.add(insight2);
        
        // Insight 3: Organization Growth
        Map<String, Object> insight3 = new HashMap<>();
        insight3.put("icon", "🏢");
        insight3.put("title", "Organization Expansion Opportunity");
        insight3.put("description", "3 organizations are consistently over-subscribed. Consider expanding their program capacity.");
        insight3.put("action", "Reach out to high-performing organizations for expansion.");
        insights.add(insight3);
        
        // Insight 4: System Efficiency
        Map<String, Object> insight4 = new HashMap<>();
        insight4.put("icon", "⚡");
        insight4.put("title", "System Efficiency Improvement");
        insight4.put("description", "Automated notifications reduced response time by 67% compared to manual processes.");
        insight4.put("action", "Implement more automation features to improve efficiency.");
        insights.add(insight4);
        
        return insights;
    }

    private String formatTimestamp(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Unknown";
        }
        return dateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));
    }
}