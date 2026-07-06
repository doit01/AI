package com.demo.ssm.event;

public record StateChangedEvent(
    String entityType,
    Long entityId,
    Enum<?> fromState,
    Enum<?> toState,
    Enum<?> event
) {}
