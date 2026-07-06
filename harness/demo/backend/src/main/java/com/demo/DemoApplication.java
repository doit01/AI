package com.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = {"com.demo", "org.springframework.statemachine.data.jpa"})
public class DemoApplication implements CommandLineRunner {
   

    public static void main(String[] args) {

        SpringApplication.run(DemoApplication.class, args);
    }
//  @Autowired
//     private StateMachine<States, Events> stateMachine;
    @Override
    public void run(String... args) throws Exception {
        // stateMachine.sendEvent(Events.E1);
        // stateMachine.sendEvent(Events.E2);
    }
}




