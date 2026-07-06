package com.demo.admin.config;

import com.demo.admin.notifier.WeChatWorkNotifier;
import de.codecentric.boot.admin.server.domain.entities.InstanceRepository;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotifierConfig {

    @Bean
    @ConfigurationProperties(prefix = "wechat.work")
    public WeChatWorkProperties weChatWorkProperties() {
        return new WeChatWorkProperties();
    }

    @Bean
    public WeChatWorkNotifier weChatWorkNotifier(InstanceRepository repository,
                                                  WeChatWorkProperties properties) {
        return new WeChatWorkNotifier(repository, properties.getWebhookUrl());
    }

    public static class WeChatWorkProperties {
        private String webhookUrl;

        public String getWebhookUrl() {
            return webhookUrl;
        }

        public void setWebhookUrl(String webhookUrl) {
            this.webhookUrl = webhookUrl;
        }
    }
}
