package com.demo.config;

import com.sun.management.OperatingSystemMXBean;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.stereotype.Component;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Endpoint(id = "system")
public class SystemEndpoint {

    private final OperatingSystemMXBean osBean;

    public SystemEndpoint() {
        this.osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
    }

    @ReadOperation
    public Map<String, Object> status() {
        Map<String, Object> result = new LinkedHashMap<>();

        double cpuLoad = osBean.getSystemCpuLoad();
        result.put("cpuLoad", cpuLoad < 0 ? "unavailable" : String.format("%.1f%%", cpuLoad * 100));
        result.put("cpuHigh", cpuLoad > 0.95);

        long freeMem = osBean.getFreeMemorySize();
        long totalMem = osBean.getTotalMemorySize();
        result.put("freeMemory", formatBytes(freeMem));
        result.put("totalMemory", formatBytes(totalMem));
        result.put("memoryLow", freeMem < 200L * 1024 * 1024);

        File root = new File(".");
        long freeDisk = root.getFreeSpace();
        long totalDisk = root.getTotalSpace();
        result.put("freeDisk", formatBytes(freeDisk));
        result.put("totalDisk", formatBytes(totalDisk));
        result.put("diskUsage", String.format("%.1f%%", (double)(totalDisk - freeDisk) / totalDisk * 100));

        return result;
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
