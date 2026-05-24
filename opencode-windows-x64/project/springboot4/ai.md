已完成！新增功能：
1. 状态持久化 (StateMachinePersist)
- StateMachineContext 实体保存状态机上下文到DB
- StateMachineHistory 实体记录每次状态变更历史
2. StateMachineFactory 线程安全
- 每个订单ID创建独立的 StateMachine 实例
- Interceptor 自动持久化状态变更
3. 动作 (Action) - OrderActions.java
   // 每个事件对应执行逻辑
   CONFIRM  -> confirmAction()      // 确认订单
   PAY      -> paymentReceivedAction() // 处理支付
   PROCESS  -> processingStartedAction()
   SHIP     -> shippingAction()
   DELIVER  -> deliveredAction()
   CANCEL   -> cancelledAction()
   REFUND   -> refundAction()
4. 守卫 (Guard) - OrderGuards.java
   // 条件检查
   paymentReceivedGuard()   // 支付金额 >= 订单金额
   paymentTimeoutGuard()    // 检查支付超时
   inventoryAvailableGuard()// 库存检查
   canCancelGuard()        // 已发货不能取消
5. 前端可视化
- 状态流转图 (动态显示当前进度)
- 状态变更时间线 (历史记录)
- 事件执行结果提示
  项目结构:
  springboot4/src/main/java/com/demo/
  ├── statemachine/
  │   ├── OrderStateMachineConfig.java  # 配置 + Actions + Guards
  │   ├── OrderStateMachineInterceptor.java # 持久化
  │   ├── action/OrderActions.java     # 动作
  │   └── guard/OrderGuards.java       # 守卫
  ├── domain/
  │   ├── Order.java
  │   ├── StateMachineContext.java     # 状态持久化
  │   └── StateMachineHistory.java     # 历史记录
  └── service/
  └── OrderStateMachineService.java