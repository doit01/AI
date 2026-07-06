package com.demo.config;

import org.springframework.boot.health.contributor.AbstractHealthIndicator;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.Health.Builder;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class DiskHealthIndicator extends AbstractHealthIndicator {

    @Override
    protected void doHealthCheck(Builder builder) {
        File root = new File(".");
        long free = root.getFreeSpace();
        long total = root.getTotalSpace();
        double usage = (double) (total - free) / total * 100;

        builder.up()
            .withDetail("total", formatBytes(total))
            .withDetail("free", formatBytes(free))
            .withDetail("usage", String.format("%.1f%%", usage))
            .withDetail("threshold", formatBytes(10L * 1024 * 1024));
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
