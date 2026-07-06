package com.demo.admin.notifier;

import de.codecentric.boot.admin.server.domain.entities.Instance;
import de.codecentric.boot.admin.server.domain.entities.InstanceRepository;
import de.codecentric.boot.admin.server.domain.events.InstanceEvent;
import de.codecentric.boot.admin.server.domain.events.InstanceStatusChangedEvent;
import de.codecentric.boot.admin.server.notify.AbstractEventNotifier;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class WeChatWorkNotifier extends AbstractEventNotifier {

    private final WebClient webClient;
    private final String webhookUrl;

    public WeChatWorkNotifier(InstanceRepository repository, String webhookUrl) {
        super(repository);
        this.webhookUrl = webhookUrl;
        this.webClient = WebClient.create();
    }

    @Override
    protected Mono<Void> doNotify(InstanceEvent event, Instance instance) {
        if (!(event instanceof InstanceStatusChangedEvent statusChange)) {
            return Mono.empty();
        }
        String status = statusChange.getStatusInfo().getStatus();

        String content = """
**应用报警** 🚨

> **应用**: %s
> **状态**: %s
> **时间**: %s
> **详情**: [查看控制台](http://localhost:9090)
"""
            .formatted(
                instance.getRegistration().getName(),
                status,
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    .withZone(ZoneId.systemDefault())
                    .format(Instant.now())
            );

        return webClient.post()
            .uri(webhookUrl)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of(
                "msgtype", "markdown",
                "markdown", Map.of("content", content)
            ))
            .retrieve()
            .toBodilessEntity()
            .then();
    }
}
