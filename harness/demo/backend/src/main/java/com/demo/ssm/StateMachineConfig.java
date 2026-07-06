// package com.demo.ssm;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.statemachine.StateContext;
// import org.springframework.statemachine.action.Action;
// import org.springframework.statemachine.config.EnableStateMachine;
// import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
// import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
// import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
// import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
// import org.springframework.statemachine.guard.Guard;
// import org.springframework.statemachine.listener.StateMachineListener;
// import org.springframework.statemachine.listener.StateMachineListenerAdapter;
// import org.springframework.statemachine.state.State;

// import java.util.EnumSet;

// @Configuration
// @EnableStateMachine
// public class StateMachineConfig
//         extends EnumStateMachineConfigurerAdapter<States, Events> {

//     @Override
//     public void configure(StateMachineConfigurationConfigurer<States, Events> config)
//             throws Exception {
//         config
//             .withConfiguration()
//                 .autoStartup(true)
//                 .listener(listener());
//     }

// //    @Override
// //    public void configure(StateMachineStateConfigurer<States, Events> states)
// //            throws Exception {
// //        states
// //            .withStates()
// //                .initial(States.SI)
// //                    .states(EnumSet.allOf(States.class));
// //    }
//     @Override
//     public void configure(StateMachineStateConfigurer<States, Events> states)
//             throws Exception {
//         states
//                 .withStates()
//                 .initial(States.S1, action())
//                 .state(States.S1, action(), null)
//                 .state(States.S2, null, action())
//                 .state(States.S2, action())
//                 .state(States.S3, action(), action());
//     }
//     @Override
//     public void configure(StateMachineTransitionConfigurer<States, Events> transitions)
//             throws Exception {
//         transitions
//             .withExternal()
//                 .source(States.SI).target(States.S1).event(Events.E1)
//                 .and()
//             .withExternal()
//                 .source(States.S1).target(States.S2).event(Events.E2).action(action());;
//     }

//     @Bean
//     public StateMachineListener<States, Events> listener() {
//         return new StateMachineListenerAdapter<States, Events>() {
//             @Override
//             public void stateChanged(State<States, Events> from, State<States, Events> to) {
//                 System.out.println("State change to " + to.getId());
//             }
//         };
//     }

// //    @Override
//     public void configure_learn(StateMachineTransitionConfigurer<States, Events> transitions)
//             throws Exception {
//         transitions
// //        适用场景：绝大多数正常业务流转。比如订单从“待支付”->“已支付”，需要清空支付超时定时器（Exit），并初始化发货倒计时（Entry）。
//                 .withExternal()
//                 .source(States.S1).target(States.S2)
//                 .event(Events.E1)
//                 .guard(guard())
//                 .and()
// //                withInternal() —— “原地待命，不下班”（特殊自循环） 待在 S2 工位，发生 E2 事件后，哪也不去,for 刷新、重试、心跳检测
//                 .withInternal()
//                 .source(States.S2)
//                 .event(Events.E2)
//                 .and()

//                 /// 不常用
//                 .withLocal()
//                 .source(States.S2).target(States.S3)
//                 .event(Events.E3);
// //        与 External 的核心区别：如果 S2 和 S3 是平级关系（没有嵌套），Local 和 External 执行效果几乎一样。但如果 S2 是一个父状态（包含很多子状态），Local 表示“我没离开这个大部门，只是内部换了个小格子”，因此不会触发父状态的 Exit 动作。
// //        适用场景：在同一区域内的子状态切换，不想重置父级共享的资源（比如不想关闭数据库连接，只想切换内部的加载状态）。
// //        withLocal()
// //                .source(S2).target(S3).event(E3)	软切换：发生 E3 从 S2 去 S3，如果 S2 是个大盒子，盒子门不关（不执行 S2 的 Exit），人直接走到隔壁 S3 去。
//     }


//     @Bean
//     public Guard<States, Events> guard() {
//         return new Guard<States, Events>() {
//             @Override
//             public boolean evaluate(StateContext<States, Events> context) {
//                 return true;
//             }
//         };
//     }
//     @Bean
//     public Action<States, Events> action() {
//         return new Action<States, Events>() {

//             @Override
//             public void execute(StateContext<States, Events> context) {
//                 // do something
//             }
//         };
//     }

// }



// //@Configuration
// //@EnableStateMachine
// //public class Config1Strings
// //        extends StateMachineConfigurerAdapter<String, String> {
// //
// //    @Override
// //    public void configure(StateMachineStateConfigurer<String, String> states)
// //            throws Exception {
// //        states
// //                .withStates()
// //                .initial("S1")
// //                .end("SF")
// //                .states(new HashSet<String>(Arrays.asList("S1","S2","S3","S4")));
// //    }
// //
// //}