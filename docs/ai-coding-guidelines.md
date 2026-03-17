# Claude Code Backend 编码规范（中文）

## 目录

### 核心架构
- [一、核心架构（COLA 分层）](#一核心架构cola-分层)
- [二、模块结构（按业务模块组织）](#二模块结构按业务模块组织)
- [三、shared 通用层规范](#三shared-通用层规范)

### 分层规范
- [四、adapter 层按触发源划分的优势](#四adapter-层按触发源划分的优势)
- [五、各层详细规范](#五各层详细规范)
- [六、复杂业务流：Executor / Phase / Step](#六复杂业务流executor--phase--step)
- [七、domain 层（领域层）](#七domain-层领域层)
- [八、Repository 规范](#八repository-规范)
- [九、Gateway 规范（防腐层）](#九gateway-规范防腐层)
- [十、infrastructure 层（基础设施层）](#十infrastructure-层基础设施层)

### 技术规范
- [十、Prisma 规范](#十prisma-规范)
- [十一、DTO / Command / Domain / Persistence 分离](#十一dto--command--domain--persistence-分离)
- [十二、简单 CRUD 规范](#十二简单-crud-规范)
- [十三、复杂度规范](#十三复杂度规范)
- [十四、命名规范](#十四命名规范)
- [十五、依赖注入规范](#十五依赖注入规范)
- [十六、事务规范](#十六事务规范)

### 质量保障
- [十七、异常处理规范](#十七异常处理规范)
- [十八、测试规范](#十八测试规范)
- [十九、日志和可观测性规范](#十九日志和可观测性规范)
- [二十、安全规范](#二十安全规范)
- [二十一、性能优化规范](#二十一性能优化规范)
- [二十二、数据库迁移规范](#二十二数据库迁移规范)

### AI 编程指南
- [二十三、AI 编码行为准则](#二十三ai-编码行为准则)
- [二十四、严禁行为](#二十四严禁行为)
- [二十五、默认决策规则](#二十五默认决策规则)
- [二十六、输出要求](#二十六输出要求)
- [二十七、编码风格](#二十七编码风格)

### 完整示例
- [二十八、完整示例：用户注册流程](#二十八完整示例用户注册流程)
- [二十九、复杂流程示例：订单提交](#二十九复杂流程示例订单提交)

---

## 角色

你是一名资深后端工程师，负责 NestJS + Prisma + PostgreSQL 项目。

必须严格遵守项目架构规范，目标：
- 保持架构边界清晰
- 业务逻辑可读
- 代码长期可维护
- 避免框架侵入领域逻辑
- 代码风格与项目统一

## 技术栈

- NestJS
- TypeScript
- Prisma
- PostgreSQL

## 一、核心架构（COLA 分层）

### 分层职责

| 层 | 职责 |
|---|---|
| adapter（适配层） | 接收外部输入，转换为内部指令 |
| application（应用层） | 编排用例与业务流程 |
| domain（领域层） | 核心业务规则与业务模型 |
| infrastructure（基础设施层） | 数据库、缓存、第三方 API 等技术实现 |

### 依赖方向（强制）

```
adapter -> application -> domain
                            ^
                            |
        infrastructure 实现 domain/application 端口
```

- adapter 可依赖 application
- application 可依赖 domain
- infrastructure 可依赖 domain 抽象
- **domain 禁止依赖任何框架**：NestJS、Prisma、HTTP、Redis、MQ 等
- **禁止反向依赖**

## 二、模块结构（按业务模块组织）

```
src
├── modules
│   └── {domain}
│       ├── adapter                    # 按触发源划分
│       │   ├── mobile                 # 移动端触发源
│       │   │   ├── dto                # 请求/响应 DTO
│       │   │   └── {domain}-mobile.controller.ts
│       │   ├── web                    # Web 端触发源
│       │   │   ├── dto
│       │   │   └── {domain}-web.controller.ts
│       │   ├── wap                    # 无线端触发源
│       │   │   ├── dto
│       │   │   └── {domain}-wap.controller.ts
│       │   ├── applet                 # 小程序触发源
│       │   │   ├── dto
│       │   │   └── {domain}-applet.controller.ts
│       │   ├── openapi                # 开放 API 触发源
│       │   │   ├── dto
│       │   │   └── {domain}-openapi.controller.ts
│       │   ├── consumer               # 消息消费触发源
│       │   │   └── {domain}.consumer.ts
│       │   ├── scheduler              # 定时任务触发源
│       │   │   └── {domain}.scheduler.ts
│       │   └── rpc                    # RPC 触发源
│       │       ├── dto
│       │       └── {domain}-rpc.controller.ts
│       ├── application                # 所有触发源共享
│       │   ├── executor               # 复杂业务流程执行器
│       │   ├── phase                  # 业务阶段
│       │   ├── step                   # 业务步骤
│       │   ├── command                # 命令对象
│       │   ├── query                  # 查询对象
│       │   ├── assembler              # 数据组装器
│       │   └── service                # 简单应用服务
│       ├── domain                     # 领域层（核心业务逻辑）
│       │   ├── entity                 # 实体
│       │   ├── value-object           # 值对象
│       │   ├── service                # 领域服务
│       │   ├── repository             # 仓储接口
│       │   ├── gateway                # 防腐层接口
│       │   └── event                  # 领域事件
│       ├── infrastructure             # 基础设施层
│       │   ├── persistence            # 仓储实现
│       │   ├── gateway                # 防腐层实现
│       │   └── mapper                 # 领域模型与持久化模型转换
│       └── {domain}.module.ts
│
└── shared                             # 跨模块共享
    ├── domain                         # 共享领域对象
    ├── infrastructure                 # 共享基础设施
    ├── constants                      # 共享常量
    └── utils                          # 共享工具类
```

**说明**：
- adapter 层按触发源划分，便于独立演进和权限控制
- 不同触发源可以有不同的 DTO，满足差异化需求
- application/domain/infrastructure 层所有触发源共享，避免重复
- 接口路由以触发源开头，如 `/mobile/order`、`/web/order`

**禁止**：全局顶层结构 `src/adapter`、`src/application` 等。

## 三、shared 通用层规范

### 允许放入 shared

- 基础实体、聚合根
- 领域异常
- Prisma 模块 / Prisma 服务
- Redis 客户端
- DI 令牌
- 工具类
- 共享常量
- 真正通用的跨模块 DTO

### 禁止放入 shared

- 业务特定服务
- 业务特定仓储
- 业务特定规则
- 业务特定流程

### 放入 shared 的条件（量化标准）

**三次原则**：
- 第一次使用：放在模块内
- 第二次复用：考虑提取，但仍可放在模块内
- 第三次使用：必须提取到 shared

**其他条件**：
- 被 3+ 个业务模块使用
- 不属于任何具体业务域
- 是基础设施能力（Prisma/Redis/Logger/MQ）

**禁止**：把 shared 当作垃圾场。

## 四、adapter 层按触发源划分的优势

### 为什么按触发源划分？

传统的按协议类型划分（http/graphql/mq）适合技术边界清晰的场景，但在多客户端业务系统中，按触发源划分有以下优势：

### 优势

1. **业务边界清晰**
   - 一眼就能看出"这是给谁用的"
   - 便于理解不同客户端的差异化需求

2. **独立演进**
   - mobile 端和 web 端可以独立迭代
   - 不同触发源的变更互不影响

3. **权限控制简单**
   - 可以针对不同触发源设置不同的认证/授权策略
   - 如：mobile 端用 JWT，web 端用 Session

4. **接口路由清晰**
   - `/mobile/order` vs `/web/order`
   - 便于监控和日志分析

5. **便于后续拆分**
   - 如果要把 mobile 端独立部署，更容易拆分
   - 触发源之间的耦合度低

### 注意事项

1. **避免重复代码**
   - application/domain/infrastructure 层必须共享
   - 不同触发源只在 adapter 层有差异

2. **DTO 可以不同，Command 必须统一**
   - 每个触发源可以有自己的 Request/Response DTO
   - 但都要转换为统一的 Command/Query

3. **不要过度拆分**
   - 如果多个触发源完全相同，可以共用一个 controller
   - 只在有差异时才拆分

### 适用场景

**推荐使用按触发源划分**：
- C 端多客户端系统（iOS、Android、H5、小程序等）
- 不同触发源有不同的认证/授权策略
- 不同触发源的 DTO 结构差异较大
- 需要独立演进和监控

**可以使用按协议类型划分**：
- B 端系统，触发源较少
- 不同触发源的业务逻辑完全相同
- 只是协议不同（HTTP vs gRPC）

## 五、各层详细规范

### 1. adapter 层（适配层）

按触发源划分，只做协议适配和请求转换。

#### 触发源类型

- **mobile**: 移动端（iOS/Android App）
- **web**: Web 端（PC 浏览器）
- **wap**: 无线端（H5）
- **applet**: 小程序（微信/支付宝等）
- **openapi**: 开放 API（提供给第三方）
- **consumer**: 消息消费者（MQ）
- **scheduler**: 定时任务
- **rpc**: RPC 调用（gRPC/Dubbo 等）

#### 允许

- controller / consumer / scheduler
- 请求 / 响应 DTO（每个触发源可以有自己的 DTO）
- 校验装饰器
- 触发源特定的认证/授权逻辑
- 触发源特定的参数转换

#### 职责流程

接收请求 → 校验 → 转为 command/query → 调用应用层 → 返回响应

#### 禁止

- 核心业务规则
- 直接使用 Prisma
- 直接数据库操作
- 复杂流程编排
- 在 adapter 层定义 command/query（应在 application 层）

#### 示例

```typescript
// adapter/mobile/user-mobile.controller.ts
@Controller('mobile/users')
@UseGuards(MobileAuthGuard)  // 移动端专属认证
export class UserMobileController {
  constructor(
    private readonly createUserExecutor: CreateUserExecutor,
  ) {}

  @Post()
  async create(@Body() req: MobileCreateUserRequest) {
    // 转换为统一的 Command
    const command = new CreateUserCommand(req.name, req.email);

    // 调用共享的应用层
    const user = await this.createUserExecutor.execute(command);

    // 转换为移动端专属的响应格式
    return MobileUserResponse.fromDomain(user);
  }
}

// adapter/web/user-web.controller.ts
@Controller('web/users')
@UseGuards(WebAuthGuard)  // Web 端专属认证
export class UserWebController {
  constructor(
    private readonly createUserExecutor: CreateUserExecutor,
  ) {}

  @Post()
  async create(@Body() req: WebCreateUserRequest) {
    // 同样转换为统一的 Command
    const command = new CreateUserCommand(req.name, req.email);

    // 调用同一个 executor
    const user = await this.createUserExecutor.execute(command);

    // 转换为 Web 端专属的响应格式
    return WebUserResponse.fromDomain(user);
  }
}

// adapter/consumer/user.consumer.ts
@Consumer()
export class UserConsumer {
  constructor(
    private readonly createUserExecutor: CreateUserExecutor,
  ) {}

  @EventPattern('user.register')
  async handleUserRegister(data: UserRegisterEvent) {
    const command = new CreateUserCommand(data.name, data.email);
    await this.createUserExecutor.execute(command);
  }
}
```

#### 触发源划分原则

- 不同触发源有不同的认证/授权策略时，必须分开
- 不同触发源的 DTO 结构差异较大时，建议分开
- 不同触发源需要独立演进时，建议分开
- 如果多个触发源完全相同，可以共用一个 controller

### 2. application 层（应用层）

负责用例编排。

#### 目录结构

- **executor/**: 复杂业务流程的执行器
- **phase/**: 业务阶段
- **step/**: 业务步骤
- **command/**: 命令对象
- **query/**: 查询对象
- **assembler/**: 组装器
- **service/**: 简单应用服务（简单 CRUD 场景）

#### 允许

- command/query
- executor
- phase
- step
- 应用服务（简单 CRUD 放在 service/ 目录）
- 用例编排
- 事务边界协调
- 调用领域模型 / 领域服务

#### 禁止

- 本该属于 domain 的业务规则
- 直接使用 Prisma
- DTO 侵入 domain

#### 简单应用服务规范

**application/service/** 适用于：
- 单一聚合根的 CRUD 操作
- 无复杂业务规则
- 仅 1-2 个仓储调用
- 业务流程少于 50 行代码

**命名规范**：
- 查询服务：`{domain}-query.service.ts`（如 `user-query.service.ts`）
- 命令服务：`{domain}-command.service.ts`（如 `user-command.service.ts`）
- 或按功能：`{domain}-{action}.service.ts`（如 `user-profile.service.ts`）

## 六、复杂业务流：Executor / Phase / Step

### 结构

```
Executor -> Phase -> Step
```

### 使用判断标准（量化）

**必须使用 Executor/Phase/Step 的场景**：
- 涉及 3+ 个聚合根的协调
- 需要调用 5+ 个外部服务或仓储
- 包含 3+ 个明确的业务阶段（如：验证 → 预处理 → 执行 → 后处理）
- 有明确的事务边界和补偿逻辑
- 业务流程超过 100 行代码

**禁止使用的场景（简单 CRUD）**：
- 单一聚合根的 CRUD 操作
- 无复杂业务规则
- 无外部依赖或仅 1-2 个仓储调用
- 业务流程少于 50 行代码

**灰色地带（可选）**：
- 2 个聚合根 + 中等复杂度业务规则
- 此时可用简单的 application service，无需 Executor

### Executor

- 命名：`{Action}{Domain}Executor`
- 职责：编排阶段、定义流程、管理上下文、控制主路径

### Phase

- 命名：`{Action}{DomainOrStage}Phase`
- 职责：分组步骤、提供业务阶段含义

### Step

- 命名：`{Action}{Target}Step`
- 一个 Step 一个职责
- 30–50 行以内
- Step 不持有核心领域规则

### 核心规则

- 流程顺序 → application
- 业务知识 → domain

### 反例

```typescript
if (order.type === 'group' && stock < 1 && warehouse !== 'cloud') {
  throw new Error('inventory not enough');
}
```

### 正例

```typescript
order.assertCanSubmit();
inventoryPolicy.assertOrderCanBeSubmitted(order);
```

## 七、domain 层（领域层）

系统核心，纯业务。

### 允许

- entity 实体
- value object 值对象
- domain service 领域服务
- repository interface 仓储接口
- gateway interface 防腐层接口
- domain event 领域事件
- 业务不变量
- 业务策略

### 禁止

- NestJS 装饰器
- Prisma 类型
- HTTP DTO
- Redis / MQ 客户端
- 任何框架代码

## 八、Repository 规范

必须分离：**领域接口 + 基础设施实现**。

### 领域接口

```typescript
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
```

### 基础设施实现

```typescript
@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}
}
```

### 规则

- domain 定义接口
- infrastructure 实现
- application 依赖抽象，不依赖实现

## 九、Gateway 规范（防腐层）

必须分离：**领域接口 + 基础设施实现**。

### 领域接口

```typescript
// domain/gateway/inventory.gateway.ts
export interface InventoryGateway {
  reserve(items: OrderItem[]): Promise<string>;
  releaseReservation(reservationId: string): Promise<void>;
}

export const INVENTORY_GATEWAY = Symbol('INVENTORY_GATEWAY');
```

### 基础设施实现

```typescript
// infrastructure/gateway/remote-inventory.gateway.ts
@Injectable()
export class RemoteInventoryGateway implements InventoryGateway {
  constructor(private readonly httpClient: HttpService) {}

  async reserve(items: OrderItem[]): Promise<string> {
    const payload = items.map(i => ({
      sku_code: i.productId,
      qty: i.quantity,
    }));

    const res = await this.httpClient.post('/api/inventory/lock', payload);
    return res.data.reservation_id;
  }

  async releaseReservation(reservationId: string): Promise<void> {
    await this.httpClient.post('/api/inventory/release', { reservationId });
  }
}
```

### Gateway vs Repository vs Service

| | Repository | Gateway | Service |
|---|---|---|---|
| **职责** | 持久化聚合根 | 调用外部系统 | 领域逻辑封装 |
| **约定** | 一个聚合根一个 Repository | 一个外部系统一个 Gateway | 按业务能力划分 |
| **方法模式** | save / findById / findByXxx | 按外部系统 API 定义 | 按业务规则定义 |
| **实现位置** | infrastructure/persistence | infrastructure/gateway | domain 或 application |
| **依赖** | 数据库（自己的） | 外部 API / RPC / MQ | 纯内存或依赖 Repository/Gateway |
| **判断标准** | 管自己的数据 | 调别人的系统 | 可纯内存运行的业务逻辑 |

### 规则

- domain 定义 gateway 接口
- infrastructure/gateway 实现
- application 依赖抽象，不依赖实现
- Gateway 隔离外部系统的协议细节，保护领域纯净

## 十、infrastructure 层（基础设施层）

只做技术实现。

### 允许

- Prisma 仓储实现
- Redis 实现
- MQ 生产 / 消费
- 外部系统网关实现
- 持久化 mapper
- 第三方 API 客户端

### 禁止

- 业务规则
- 领域决策
- 用例编排

## 十、Prisma 规范

- **Prisma 只能在 infrastructure 使用**
- 禁止 domain / application / adapter 直接使用
- **Prisma 模型 ≠ 领域实体**
- 使用 mapper 转换领域实体 ↔ 持久化模型
- 禁止向上泄露 Prisma 类型

## 十一、DTO / Command / Domain / Persistence 分离

### 正确流向

```
请求 DTO -> Command -> Domain Entity -> Persistence Model
```

### 禁止

```
DTO = Domain Entity
Domain Entity = Prisma Model
```

### 映射规则

跨层必须显式转换：
- DTO → Command
- Command → Domain Entity
- Domain Entity ↔ Persistence Record
- Domain Entity → 响应 DTO

## 十二、简单 CRUD 规范

不需要 Executor/Phase/Step：

```
controller -> application service -> repository -> infrastructure
```

## 十三、复杂度规范

一个类不应该：
- 超过 300 行
- 方法超过 50 行
- 嵌套深度 > 3 层

逻辑过大拆分：
- executor
- phase
- step
- domain service
- value object
- policy

## 十四、命名规范

- Executor: `{Action}{Domain}Executor`
- Phase: `{Action}{DomainOrStage}Phase`
- Step: `{Action}{Target}Step`
- Command: `{Action}{Domain}Command`
- Query: `{Action}{Domain}Query`
- Repository: `{Domain}Repository` / `Prisma{Domain}Repository`
- Gateway: `{ExternalSystem}Gateway` / `Remote{ExternalSystem}Gateway`
- Controller: `{Domain}Controller`

**避免模糊命名**：Processor、Manager、Handler、Util、CommonService

## 十五、依赖注入规范

- application 依赖仓储接口
- infrastructure 提供实现
- 禁止基础设施实现直接注入 domain
- 推荐使用显式 Token 绑定

## 十六、事务规范

- 事务边界 → application 层
- domain 与事务无关
- infrastructure 提供事务能力

## 十七、异常处理规范

### 异常分类

- 请求校验异常 → adapter
- 业务规则异常 → domain
- 技术异常 → infrastructure
- application 可转换异常，但不创造业务规则
- 优先使用业务语义异常

### 领域异常示例

```typescript
// shared/domain/exception/domain.exception.ts
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// modules/order/domain/exception/order-cannot-be-cancelled.exception.ts
export class OrderCannotBeCancelledException extends DomainException {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
  ) {
    super(`订单 ${orderId} 无法取消: ${reason}`);
  }
}

// domain 层使用
export class Order extends AggregateRoot {
  cancel(): void {
    if (this.status === OrderStatus.SHIPPED) {
      throw new OrderCannotBeCancelledException(
        this.id,
        '订单已发货',
      );
    }
    this.status = OrderStatus.CANCELLED;
  }
}
```

### 全局异常过滤器

```typescript
// shared/infrastructure/filter/domain-exception.filter.ts
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(400).json({
      code: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 异常处理原则

- domain 层：抛出业务异常，不捕获
- application 层：传递异常，必要时转换为应用异常
- adapter 层：通过全局过滤器统一处理
- infrastructure 层：捕获技术异常，转换为领域异常或应用异常

## 十八、测试规范

### 测试分层

| 测试类型 | 测试目标 | 位置 | 依赖 |
|---------|---------|------|------|
| 单元测试 | domain 层 | `domain/**/*.spec.ts` | 无外部依赖，纯业务逻辑 |
| 集成测试 | application 层 | `application/**/*.spec.ts` | Mock repository |
| E2E 测试 | adapter 层 | `test/e2e/**/*.e2e-spec.ts` | 真实数据库（测试库） |

### 单元测试示例（domain 层）

```typescript
// modules/order/domain/entity/order.spec.ts
describe('Order', () => {
  it('应该能够取消待支付订单', () => {
    const order = Order.create({
      userId: 'user-1',
      items: [/* ... */],
    });

    order.cancel();

    expect(order.status).toBe(OrderStatus.CANCELLED);
  });

  it('已发货订单不能取消', () => {
    const order = Order.create({/* ... */});
    order.ship();

    expect(() => order.cancel()).toThrow(OrderCannotBeCancelledException);
  });
});
```

### 集成测试示例（application 层）

```typescript
// modules/order/application/executor/create-order.executor.spec.ts
describe('CreateOrderExecutor', () => {
  let executor: CreateOrderExecutor;
  let orderRepository: jest.Mocked<OrderRepository>;
  let inventoryGateway: jest.Mocked<InventoryGateway>;

  beforeEach(() => {
    orderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as any;

    inventoryGateway = {
      reserve: jest.fn(),
    } as any;

    executor = new CreateOrderExecutor(
      orderRepository,
      inventoryGateway,
    );
  });

  it('应该创建订单并预留库存', async () => {
    const command = new CreateOrderCommand(/* ... */);

    await executor.execute(command);

    expect(inventoryGateway.reserve).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalled();
  });
});
```

### E2E 测试示例

```typescript
// test/e2e/order.e2e-spec.ts
describe('Order API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/orders (POST)', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ userId: 'user-1', items: [/* ... */] })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
      });
  });
});
```

### 测试原则

- domain 层：100% 覆盖核心业务规则
- application 层：覆盖主要用例流程
- adapter 层：E2E 测试覆盖关键路径
- 禁止测试框架代码（NestJS 装饰器、Prisma 查询）
- Mock 策略：只 mock 外部依赖（repository、外部服务）

## 十九、日志和可观测性规范

### 日志分层

| 层 | 日志内容 | 日志级别 |
|----|---------|---------|
| adapter | 请求/响应、参数校验失败 | INFO, WARN |
| application | 用例开始/结束、关键决策点 | INFO, DEBUG |
| domain | 业务规则违反、领域事件 | WARN, ERROR |
| infrastructure | 数据库操作、外部调用、技术异常 | DEBUG, ERROR |

### 日志示例

```typescript
// application 层
export class CreateOrderExecutor {
  private readonly logger = new Logger(CreateOrderExecutor.name);

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    this.logger.log(`开始创建订单: userId=${command.userId}`);

    try {
      // 业务逻辑
      const order = await this.createOrder(command);

      this.logger.log(`订单创建成功: orderId=${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`订单创建失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}

// infrastructure 层
export class PrismaOrderRepository implements OrderRepository {
  private readonly logger = new Logger(PrismaOrderRepository.name);

  async save(order: Order): Promise<void> {
    this.logger.debug(`保存订单: orderId=${order.id}`);

    try {
      await this.prisma.order.create({
        data: this.mapper.toPersistence(order),
      });
    } catch (error) {
      this.logger.error(`订单保存失败: ${error.message}`);
      throw new RepositoryException('订单保存失败', error);
    }
  }
}
```

### 链路追踪

```typescript
// shared/infrastructure/interceptor/trace.interceptor.ts
@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const traceId = request.headers['x-trace-id'] || uuidv4();

    // 将 traceId 注入到 AsyncLocalStorage
    return next.handle().pipe(
      tap(() => {
        // 在响应头中返回 traceId
        const response = context.switchToHttp().getResponse();
        response.setHeader('x-trace-id', traceId);
      }),
    );
  }
}
```

### 监控埋点

```typescript
// 关键业务指标
export class CreateOrderExecutor {
  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    const startTime = Date.now();

    try {
      const order = await this.createOrder(command);

      // 成功指标
      this.metrics.increment('order.created.success');
      this.metrics.timing('order.created.duration', Date.now() - startTime);

      return order;
    } catch (error) {
      // 失败指标
      this.metrics.increment('order.created.failure');
      throw error;
    }
  }
}
```

### 日志原则

- 禁止打印敏感信息（密码、token、身份证号）
- 生产环境默认 INFO 级别
- 关键业务操作必须记录
- 异常必须记录完整堆栈
- 使用结构化日志（JSON 格式）

## 二十、安全规范

### 认证授权

```typescript
// adapter 层处理认证
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  @Post()
  @Roles('user', 'admin')
  @UseGuards(RolesGuard)
  async create(@Body() req: CreateOrderRequest, @User() user: UserInfo) {
    return this.createOrderExecutor.execute(
      new CreateOrderCommand(user.id, req.items),
    );
  }
}
```

### 数据脱敏

```typescript
// domain 层
export class User extends AggregateRoot {
  private phone: string;

  // 脱敏方法
  getMaskedPhone(): string {
    return this.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
}

// adapter 层响应 DTO
export class UserResponse {
  id: string;
  name: string;
  phone: string; // 已脱敏

  static fromDomain(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      phone: user.getMaskedPhone(), // 使用脱敏方法
    };
  }
}
```

### SQL 注入防护

```typescript
// ✅ 正确：使用 Prisma 参数化查询
async findByEmail(email: string): Promise<User | null> {
  const record = await this.prisma.user.findUnique({
    where: { email }, // Prisma 自动防注入
  });
  return record ? this.mapper.toDomain(record) : null;
}

// ❌ 错误：使用原始 SQL 拼接
async findByEmail(email: string): Promise<User | null> {
  const record = await this.prisma.$queryRaw(
    `SELECT * FROM users WHERE email = '${email}'` // 危险！
  );
  return record ? this.mapper.toDomain(record) : null;
}

// ✅ 如果必须使用原始 SQL，使用参数化
async findByEmail(email: string): Promise<User | null> {
  const record = await this.prisma.$queryRaw`
    SELECT * FROM users WHERE email = ${email}
  `;
  return record ? this.mapper.toDomain(record) : null;
}
```

### XSS 防护

```typescript
// adapter 层校验和清理输入
export class CreatePostRequest {
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => sanitizeHtml(value)) // 清理 HTML
  content: string;
}
```

### 安全原则

- 认证授权在 adapter 层处理
- 敏感数据在 domain 层脱敏
- 使用 Prisma 参数化查询防止 SQL 注入
- 输入校验和清理在 adapter 层
- 禁止在日志中打印敏感信息
- 使用环境变量管理密钥，禁止硬编码

## 二十一、性能优化规范

### N+1 查询问题

```typescript
// ❌ 错误：N+1 查询
async getOrdersWithItems(userId: string): Promise<Order[]> {
  const orders = await this.prisma.order.findMany({
    where: { userId },
  });

  // 每个订单都会查询一次数据库
  for (const order of orders) {
    order.items = await this.prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
  }

  return orders;
}

// ✅ 正确：使用 include 预加载
async getOrdersWithItems(userId: string): Promise<Order[]> {
  const orders = await this.prisma.order.findMany({
    where: { userId },
    include: { items: true }, // 一次查询获取所有数据
  });

  return orders.map(this.mapper.toDomain);
}
```

### 缓存策略

```typescript
// infrastructure 层实现缓存
export class CachedUserRepository implements UserRepository {
  constructor(
    private readonly prismaRepo: PrismaUserRepository,
    private readonly redis: RedisService,
  ) {}

  async findById(id: string): Promise<User | null> {
    // 先查缓存
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 缓存未命中，查数据库
    const user = await this.prismaRepo.findById(id);
    if (user) {
      await this.redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
    }

    return user;
  }

  async save(user: User): Promise<void> {
    await this.prismaRepo.save(user);
    // 更新后清除缓存
    await this.redis.del(`user:${user.id}`);
  }
}
```

### 分页查询

```typescript
// application 层
export class ListOrdersQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly pageSize: number = 20,
  ) {
    // 限制最大页大小
    if (pageSize > 100) {
      this.pageSize = 100;
    }
  }
}

// repository 接口
export interface OrderRepository {
  findByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ orders: Order[]; total: number }>;
}

// infrastructure 实现
async findByUserId(
  userId: string,
  page: number,
  pageSize: number,
): Promise<{ orders: Order[]; total: number }> {
  const [orders, total] = await Promise.all([
    this.prisma.order.findMany({
      where: { userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders: orders.map(this.mapper.toDomain),
    total,
  };
}
```

### 性能原则

- 避免 N+1 查询，使用 Prisma include/select
- 热点数据使用 Redis 缓存
- 列表查询必须分页，限制最大页大小
- 大批量操作使用事务批处理
- 数据库索引覆盖常用查询条件
- 避免在循环中进行数据库操作

## 二十二、数据库迁移规范

### Prisma 迁移流程

```bash
# 开发环境：创建迁移
npx prisma migrate dev --name add_user_phone

# 生产环境：应用迁移
npx prisma migrate deploy
```

### 迁移原则

- 每次 schema 变更必须创建迁移文件
- 迁移文件必须提交到版本控制
- 生产环境禁止使用 `prisma db push`
- 破坏性变更（删除字段/表）分步进行：
  1. 先部署代码停止使用该字段
  2. 观察一段时间
  3. 再执行删除迁移

### 向后兼容的迁移

```prisma
// ✅ 正确：添加可选字段
model User {
  id    String  @id
  name  String
  phone String? // 可选字段，不影响现有数据
}

// ❌ 错误：添加必填字段（会导致现有数据迁移失败）
model User {
  id    String @id
  name  String
  phone String // 必填字段，现有数据没有该值
}

// ✅ 正确：添加必填字段时提供默认值
model User {
  id    String @id
  name  String
  phone String @default("") // 提供默认值
}
```

## 二十三、AI 编码行为准则

生成代码必须：
- 保持 COLA 边界
- 按业务模块组织
- 复杂流程才用 Executor/Phase/Step
- 业务规则放入 domain
- Prisma 只在 infrastructure
- DTO 不侵入 domain
- 仓储接口 + 实现分离
- 禁止跨层泄露
- 命名清晰稳定
- 可读性优先

不确定时优先：
- 更清晰的边界
- 更小的单元
- 更显式的映射
- 更少框架侵入

## 二十四、严禁行为

### 禁止列表

- 业务逻辑写在 controller
- 核心业务写在 Prisma 仓储
- Prisma 模型当领域实体
- DTO 泄露到 domain
- domain 依赖 NestJS
- 巨型万能服务类
- 简单 CRUD 强行用 Executor/Phase/Step
- 随意代码丢进 shared
- 破坏依赖方向

### 反例对比

#### ❌ 反例 1：业务逻辑写在 controller

```typescript
@Controller('orders')
export class OrderController {
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    // ❌ 业务规则写在 controller
    if (dto.amount < 0) {
      throw new Error('金额不能为负数');
    }

    if (dto.items.length === 0) {
      throw new Error('订单项不能为空');
    }

    // ❌ 直接使用 Prisma
    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        items: { create: dto.items },
      },
    });

    return order;
  }
}
```

#### ✅ 正例 1：职责分离

```typescript
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderExecutor: CreateOrderExecutor,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    // ✅ 只做协议适配
    const command = new CreateOrderCommand(
      dto.userId,
      dto.items,
      dto.couponCode,
    );

    return this.createOrderExecutor.execute(command);
  }
}
```

#### ❌ 反例 2：Prisma 模型当领域实体

```typescript
// ❌ 直接使用 Prisma 生成的类型
import { Order as PrismaOrder } from '@prisma/client';

export class CreateOrderExecutor {
  async execute(command: CreateOrderCommand): Promise<PrismaOrder> {
    // ❌ Prisma 类型泄露到应用层
    const order = await this.prisma.order.create({
      data: { /* ... */ },
    });

    return order; // ❌ 返回 Prisma 模型
  }
}
```

#### ✅ 正例 2：领域实体与持久化模型分离

```typescript
// ✅ 定义领域实体
export class Order extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    private items: OrderItem[],
    private status: OrderStatus,
  ) {
    super();
  }

  submit(): void {
    // ✅ 业务规则在领域实体中
    if (this.items.length === 0) {
      throw new EmptyOrderException();
    }
    this.status = OrderStatus.PENDING_PAYMENT;
  }
}

// ✅ 使用 mapper 转换
export class CreateOrderExecutor {
  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    const order = Order.create(command.userId, command.items);
    order.submit();

    await this.orderRepository.save(order); // ✅ 保存领域实体

    return OrderDto.fromDomain(order); // ✅ 转换为 DTO
  }
}
```

#### ❌ 反例 3：domain 依赖框架

```typescript
// ❌ domain 层使用 NestJS 装饰器
import { Injectable } from '@nestjs/common';

@Injectable() // ❌ 不应该在 domain 使用
export class OrderService {
  constructor(
    @Inject(PRISMA_SERVICE) // ❌ 不应该依赖 Prisma
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(userId: string): Promise<Order> {
    // ❌ domain 层直接操作数据库
    const record = await this.prisma.order.create({
      data: { userId },
    });

    return record;
  }
}
```

#### ✅ 正例 3：domain 层纯业务

```typescript
// ✅ domain 层不依赖任何框架
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository, // ✅ 依赖抽象
  ) {}

  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    // ✅ 纯业务逻辑
    const order = Order.create(userId, items);

    // ✅ 业务规则验证
    order.validate();

    // ✅ 通过仓储接口保存
    await this.orderRepository.save(order);

    return order;
  }
}
```

#### ❌ 反例 4：简单 CRUD 强行用 Executor/Phase/Step

```typescript
// ❌ 简单的用户查询，不需要 Executor
export class GetUserExecutor {
  constructor(
    private readonly getUserPhase: GetUserPhase,
  ) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    const context = { query };
    await this.getUserPhase.execute(context);
    return context.user;
  }
}

export class GetUserPhase {
  constructor(
    private readonly getUserStep: GetUserStep,
  ) {}

  async execute(context: any): Promise<void> {
    await this.getUserStep.execute(context);
  }
}

export class GetUserStep {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(context: any): Promise<void> {
    context.user = await this.userRepository.findById(context.query.id);
  }
}
```

#### ✅ 正例 4：简单 CRUD 用简单结构

```typescript
// ✅ 简单查询直接用 application service
// modules/user/application/service/user-query.service.ts
@Injectable()
export class UserQueryService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async getById(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return UserDto.fromDomain(user);
  }
}
```

#### ❌ 反例 5：DTO 泄露到 domain

```typescript
// ❌ domain 层使用 HTTP DTO
import { CreateOrderRequest } from '../../adapter/http/dto/create-order.request';

export class Order extends AggregateRoot {
  static create(dto: CreateOrderRequest): Order { // ❌ 参数是 DTO
    return new Order(
      uuidv4(),
      dto.userId,
      dto.items,
      OrderStatus.DRAFT,
    );
  }
}
```

#### ✅ 正例 5：domain 层使用领域概念

```typescript
// ✅ domain 层使用领域概念
export class Order extends AggregateRoot {
  static create(
    userId: string,
    items: OrderItem[], // ✅ 领域对象
  ): Order {
    if (items.length === 0) {
      throw new EmptyOrderException();
    }

    return new Order(
      uuidv4(),
      userId,
      items,
      OrderStatus.DRAFT,
    );
  }
}

// ✅ adapter 层转换 DTO 为领域对象
@Controller('orders')
export class OrderController {
  @Post()
  async create(@Body() dto: CreateOrderRequest) {
    const items = dto.items.map(item =>
      new OrderItem(item.productId, item.quantity, item.price),
    );

    const command = new CreateOrderCommand(dto.userId, items);

    return this.createOrderExecutor.execute(command);
  }
}
```

### 为什么禁止这些行为？

| 禁止行为 | 后果 | 正确做法 |
|---------|------|---------|
| 业务逻辑写在 controller | 业务规则分散，难以复用和测试 | 业务逻辑放在 domain/application |
| Prisma 模型当领域实体 | 持久化模型变更影响业务逻辑 | 使用 mapper 分离 |
| domain 依赖框架 | 业务逻辑与技术实现耦合 | domain 只依赖业务概念 |
| 简单 CRUD 用 Executor | 过度设计，增加复杂度 | 简单场景用简单结构 |
| DTO 泄露到 domain | 外部协议影响核心业务 | 在边界转换为领域对象 |

## 二十五、默认决策规则

### 简单 CRUD

```
adapter → application service → repository → infrastructure
```

### 复杂流程

```
adapter → executor → phase → step → domain → repository interface → infrastructure
```

- 可复用业务规则 → domain
- 可复用非业务通用能力 → shared

## 二十六、输出要求

- 文件结构
- 文件名
- 完整类定义
- 职责分离清晰
- 最少必要注释
- 无多余抽象
- 无架构违规

**与架构冲突时，优先遵守架构。**

## 二十七、编码风格

- 清晰 TypeScript 类型
- 显式构造函数
- 方法简短
- 避免魔法行为
- 避免隐藏耦合
- 流程自上而下可读
- domain 面向业务、表达力强

**代码必须易于阅读、评审、扩展。**

## 二十八、完整示例：用户注册流程

以下是一个完整的端到端示例，展示从 adapter 到 infrastructure 的完整链路（按触发源划分）。

### 1. adapter 层 - Mobile Controller

```typescript
// modules/user/adapter/mobile/user-mobile.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RegisterUserExecutor } from '../../application/executor/register-user.executor';
import { RegisterUserCommand } from '../../application/command/register-user.command';
import { MobileRegisterUserRequest } from './dto/mobile-register-user.request';
import { MobileUserResponse } from './dto/mobile-user.response';
import { MobileAuthGuard } from '../../../../shared/infrastructure/guard/mobile-auth.guard';

@Controller('mobile/users')
@UseGuards(MobileAuthGuard)
export class UserMobileController {
  constructor(
    private readonly registerUserExecutor: RegisterUserExecutor,
  ) {}

  @Post('register')
  async register(@Body() req: MobileRegisterUserRequest): Promise<MobileUserResponse> {
    const command = new RegisterUserCommand(
      req.email,
      req.password,
      req.name,
    );

    const user = await this.registerUserExecutor.execute(command);

    return MobileUserResponse.fromDomain(user);
  }
}
```

### 2. adapter 层 - Web Controller

```typescript
// modules/user/adapter/web/user-web.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RegisterUserExecutor } from '../../application/executor/register-user.executor';
import { RegisterUserCommand } from '../../application/command/register-user.command';
import { WebRegisterUserRequest } from './dto/web-register-user.request';
import { WebUserResponse } from './dto/web-user.response';
import { WebAuthGuard } from '../../../../shared/infrastructure/guard/web-auth.guard';

@Controller('web/users')
@UseGuards(WebAuthGuard)
export class UserWebController {
  constructor(
    private readonly registerUserExecutor: RegisterUserExecutor,
  ) {}

  @Post('register')
  async register(@Body() req: WebRegisterUserRequest): Promise<WebUserResponse> {
    const command = new RegisterUserCommand(
      req.email,
      req.password,
      req.name,
    );

    const user = await this.registerUserExecutor.execute(command);

    return WebUserResponse.fromDomain(user);
  }
}
```

### 3. adapter 层 - DTO

```typescript
// modules/user/adapter/mobile/dto/mobile-register-user.request.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class MobileRegisterUserRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}

// modules/user/adapter/mobile/dto/mobile-user.response.ts
import { User } from '../../../domain/entity/user.entity';

export class MobileUserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;

  static fromDomain(user: User): MobileUserResponse {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}

// modules/user/adapter/web/dto/web-register-user.request.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class WebRegisterUserRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}

// modules/user/adapter/web/dto/web-user.response.ts
import { User } from '../../../domain/entity/user.entity';

export class WebUserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;

  static fromDomain(user: User): WebUserResponse {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
```

### 4. application 层 - Command

```typescript
// modules/user/application/command/register-user.command.ts
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
  ) {}
}
```

### 4. application 层 - Command（所有触发源共享）

```typescript
// modules/user/application/command/register-user.command.ts
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
  ) {}
}
```

### 5. application 层 - Executor（所有触发源共享）

```typescript
// modules/user/application/executor/register-user.executor.ts
import { Injectable } from '@nestjs/common';
import { RegisterUserCommand } from '../command/register-user.command';
import { User } from '../../domain/entity/user.entity';
import { UserRepository } from '../../domain/repository/user.repository';
import { Email } from '../../domain/value-object/email.vo';
import { Password } from '../../domain/value-object/password.vo';
import { UserAlreadyExistsException } from '../../domain/exception/user-already-exists.exception';

@Injectable()
export class RegisterUserExecutor {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    // 1. 检查邮箱是否已存在
    const email = Email.create(command.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    // 2. 创建用户实体
    const password = await Password.create(command.password);
    const user = User.register(email, password, command.name);

    // 3. 保存用户
    await this.userRepository.save(user);

    return user;
  }
}
```

### 6. domain 层 - Entity

```typescript
// modules/user/domain/entity/user.entity.ts
import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { Email } from '../value-object/email.vo';
import { Password } from '../value-object/password.vo';
import { v4 as uuidv4 } from 'uuid';

export class User extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    private password: Password,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {
    super();
  }

  static register(
    email: Email,
    password: Password,
    name: string,
  ): User {
    return new User(
      uuidv4(),
      email,
      password,
      name,
      new Date(),
    );
  }

  verifyPassword(plainPassword: string): boolean {
    return this.password.verify(plainPassword);
  }

  changePassword(newPassword: Password): void {
    this.password = newPassword;
  }
}
```

### 7. domain 层 - Value Object

```typescript
// modules/user/domain/value-object/email.vo.ts
import { InvalidEmailException } from '../exception/invalid-email.exception';

export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new InvalidEmailException(email);
    }
    return new Email(email.toLowerCase());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// modules/user/domain/value-object/password.vo.ts
import * as bcrypt from 'bcrypt';
import { WeakPasswordException } from '../exception/weak-password.exception';

export class Password {
  private constructor(private readonly hashedValue: string) {}

  static async create(plainPassword: string): Promise<Password> {
    if (plainPassword.length < 8) {
      throw new WeakPasswordException('密码长度至少 8 位');
    }

    const hashed = await bcrypt.hash(plainPassword, 10);
    return new Password(hashed);
  }

  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  async verify(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHash(): string {
    return this.hashedValue;
  }
}
```

### 8. domain 层 - Repository Interface

```typescript
// modules/user/domain/repository/user.repository.ts
import { User } from '../entity/user.entity';
import { Email } from '../value-object/email.vo';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```

### 9. domain 层 - Exception

```typescript
// modules/user/domain/exception/user-already-exists.exception.ts
import { DomainException } from '../../../../shared/domain/exception/domain.exception';

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`用户已存在: ${email}`);
  }
}

// modules/user/domain/exception/invalid-email.exception.ts
export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`无效的邮箱地址: ${email}`);
  }
}
```

### 10. infrastructure 层 - Repository Implementation

```typescript
// modules/user/infrastructure/persistence/prisma-user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { UserRepository } from '../../domain/repository/user.repository';
import { User } from '../../domain/entity/user.entity';
import { Email } from '../../domain/value-object/email.vo';
import { UserMapper } from '../mapper/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserMapper,
  ) {}

  async save(user: User): Promise<void> {
    const data = this.mapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    return record ? this.mapper.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    return record ? this.mapper.toDomain(record) : null;
  }
}
```

### 11. infrastructure 层 - Mapper

```typescript
// modules/user/infrastructure/mapper/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/entity/user.entity';
import { Email } from '../../domain/value-object/email.vo';
import { Password } from '../../domain/value-object/password.vo';

@Injectable()
export class UserMapper {
  toDomain(record: PrismaUser): User {
    return User['create']( // 使用私有构造函数
      record.id,
      Email.create(record.email),
      Password.fromHash(record.password),
      record.name,
      record.createdAt,
    );
  }

  toPersistence(user: User): Omit<PrismaUser, 'updatedAt'> {
    return {
      id: user.id,
      email: user.email.value,
      password: user['password'].getHash(), // 访问私有属性
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
```

### 12. Module 配置

```typescript
// modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserMobileController } from './adapter/mobile/user-mobile.controller';
import { UserWebController } from './adapter/web/user-web.controller';
import { RegisterUserExecutor } from './application/executor/register-user.executor';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { UserMapper } from './infrastructure/mapper/user.mapper';
import { USER_REPOSITORY } from './domain/repository/user.repository';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [
    UserMobileController,  // 移动端 controller
    UserWebController,     // Web 端 controller
  ],
  providers: [
    RegisterUserExecutor,  // 所有触发源共享
    UserMapper,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
```

### 13. 测试示例

```typescript
// modules/user/domain/entity/user.spec.ts
describe('User', () => {
  it('应该能够注册新用户', async () => {
    const email = Email.create('test@example.com');
    const password = await Password.create('password123');

    const user = User.register(email, password, 'Test User');

    expect(user.id).toBeDefined();
    expect(user.email.value).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });

  it('应该能够验证密码', async () => {
    const email = Email.create('test@example.com');
    const password = await Password.create('password123');
    const user = User.register(email, password, 'Test User');

    const isValid = await user.verifyPassword('password123');

    expect(isValid).toBe(true);
  });
});

// modules/user/application/executor/register-user.executor.spec.ts
describe('RegisterUserExecutor', () => {
  let executor: RegisterUserExecutor;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    executor = new RegisterUserExecutor(userRepository);
  });

  it('应该成功注册新用户', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const command = new RegisterUserCommand(
      'test@example.com',
      'password123',
      'Test User',
    );

    const user = await executor.execute(command);

    expect(user.email.value).toBe('test@example.com');
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  it('邮箱已存在时应该抛出异常', async () => {
    const existingUser = User.register(
      Email.create('test@example.com'),
      await Password.create('password123'),
      'Existing User',
    );

    userRepository.findByEmail.mockResolvedValue(existingUser);

    const command = new RegisterUserCommand(
      'test@example.com',
      'password123',
      'Test User',
    );

    await expect(executor.execute(command)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });
});
```

### 示例说明

这个完整示例展示了：

1. **按触发源划分 adapter 层**：mobile 和 web 有独立的 controller 和 DTO
2. **清晰的分层**：adapter → application → domain → infrastructure
3. **依赖方向**：adapter 依赖 application，application 依赖 domain，infrastructure 实现 domain 接口
4. **application 层共享**：所有触发源共享同一个 Command 和 Executor
5. **DTO 分离**：不同触发源可以有不同的 DTO，但都转换为统一的 Command
6. **值对象**：Email 和 Password 封装业务规则
7. **Repository 模式**：接口在 domain，实现在 infrastructure
8. **Mapper**：领域实体与持久化模型的转换
9. **异常处理**：业务异常在 domain 层定义
10. **测试**：domain 层和 application 层的单元测试

这是一个简单 CRUD 场景，因此没有使用 Phase/Step，而是直接使用 Executor 编排流程。

## 二十九、复杂流程示例：订单提交

以下是一个复杂业务流程的示例，展示 Executor/Phase/Step 的使用。

### 1. application 层 - Executor

```typescript
// modules/order/application/executor/submit-order.executor.ts
import { Injectable } from '@nestjs/common';
import { SubmitOrderCommand } from '../command/submit-order.command';
import { ValidateOrderPhase } from '../phase/validate-order.phase';
import { ReserveResourcesPhase } from '../phase/reserve-resources.phase';
import { CreateOrderPhase } from '../phase/create-order.phase';
import { OrderDto } from '../dto/order.dto';

export interface SubmitOrderContext {
  command: SubmitOrderCommand;
  order?: Order;
  inventoryReservationId?: string;
  couponUsageId?: string;
}

@Injectable()
export class SubmitOrderExecutor {
  constructor(
    private readonly validatePhase: ValidateOrderPhase,
    private readonly reservePhase: ReserveResourcesPhase,
    private readonly createPhase: CreateOrderPhase,
  ) {}

  async execute(command: SubmitOrderCommand): Promise<OrderDto> {
    const context: SubmitOrderContext = { command };

    try {
      // 阶段 1: 验证
      await this.validatePhase.execute(context);

      // 阶段 2: 预留资源
      await this.reservePhase.execute(context);

      // 阶段 3: 创建订单
      await this.createPhase.execute(context);

      return OrderDto.fromDomain(context.order!);
    } catch (error) {
      // 补偿逻辑
      await this.compensate(context);
      throw error;
    }
  }

  private async compensate(context: SubmitOrderContext): Promise<void> {
    // 释放已预留的资源
    if (context.inventoryReservationId) {
      await this.reservePhase.rollback(context);
    }
  }
}
```

### 2. application 层 - Phase

```typescript
// modules/order/application/phase/validate-order.phase.ts
import { Injectable } from '@nestjs/common';
import { SubmitOrderContext } from '../executor/submit-order.executor';
import { ValidateUserStep } from '../step/validate-user.step';
import { ValidateItemsStep } from '../step/validate-items.step';
import { ValidateCouponStep } from '../step/validate-coupon.step';

@Injectable()
export class ValidateOrderPhase {
  constructor(
    private readonly validateUserStep: ValidateUserStep,
    private readonly validateItemsStep: ValidateItemsStep,
    private readonly validateCouponStep: ValidateCouponStep,
  ) {}

  async execute(context: SubmitOrderContext): Promise<void> {
    await this.validateUserStep.execute(context);
    await this.validateItemsStep.execute(context);

    if (context.command.couponCode) {
      await this.validateCouponStep.execute(context);
    }
  }
}

// modules/order/application/phase/reserve-resources.phase.ts
import { Injectable } from '@nestjs/common';
import { SubmitOrderContext } from '../executor/submit-order.executor';
import { ReserveInventoryStep } from '../step/reserve-inventory.step';
import { LockCouponStep } from '../step/lock-coupon.step';

@Injectable()
export class ReserveResourcesPhase {
  constructor(
    private readonly reserveInventoryStep: ReserveInventoryStep,
    private readonly lockCouponStep: LockCouponStep,
  ) {}

  async execute(context: SubmitOrderContext): Promise<void> {
    // 预留库存
    context.inventoryReservationId =
      await this.reserveInventoryStep.execute(context);

    // 锁定优惠券
    if (context.command.couponCode) {
      context.couponUsageId =
        await this.lockCouponStep.execute(context);
    }
  }

  async rollback(context: SubmitOrderContext): Promise<void> {
    if (context.inventoryReservationId) {
      await this.reserveInventoryStep.rollback(
        context.inventoryReservationId,
      );
    }

    if (context.couponUsageId) {
      await this.lockCouponStep.rollback(context.couponUsageId);
    }
  }
}
```

### 3. application 层 - Step

```typescript
// modules/order/application/step/validate-items.step.ts
import { Injectable } from '@nestjs/common';
import { SubmitOrderContext } from '../executor/submit-order.executor';
import { ProductRepository } from '../../domain/repository/product.repository';
import { InvalidOrderItemException } from '../../domain/exception/invalid-order-item.exception';

@Injectable()
export class ValidateItemsStep {
  constructor(
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(context: SubmitOrderContext): Promise<void> {
    const { items } = context.command;

    // 批量查询商品
    const productIds = items.map(item => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    // 验证商品存在性和状态
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);

      if (!product) {
        throw new InvalidOrderItemException(
          `商品不存在: ${item.productId}`,
        );
      }

      if (!product.isAvailable()) {
        throw new InvalidOrderItemException(
          `商品已下架: ${product.name}`,
        );
      }

      if (item.quantity <= 0) {
        throw new InvalidOrderItemException(
          `商品数量必须大于 0`,
        );
      }
    }
  }
}

// modules/order/application/step/reserve-inventory.step.ts
import { Injectable } from '@nestjs/common';
import { SubmitOrderContext } from '../executor/submit-order.executor';
import { InventoryGateway } from '../../domain/gateway/inventory.gateway';

@Injectable()
export class ReserveInventoryStep {
  constructor(
    private readonly inventoryGateway: InventoryGateway,
  ) {}

  async execute(context: SubmitOrderContext): Promise<string> {
    const { items } = context.command;

    // 调用防腐层网关预留库存
    const reservationId = await this.inventoryGateway.reserve(items);

    return reservationId;
  }

  async rollback(reservationId: string): Promise<void> {
    await this.inventoryGateway.releaseReservation(reservationId);
  }
}
```

### 4. domain 层 - Gateway Interface

```typescript
// modules/order/domain/gateway/inventory.gateway.ts
export interface InventoryGateway {
  reserve(items: OrderItem[]): Promise<string>;
  releaseReservation(reservationId: string): Promise<void>;
  confirm(reservationId: string): Promise<void>;
}

export const INVENTORY_GATEWAY = Symbol('INVENTORY_GATEWAY');
```

### 示例说明

这个复杂流程示例展示了：

1. **Executor**：编排 3 个阶段（验证 → 预留资源 → 创建订单）
2. **Phase**：每个阶段包含多个步骤
3. **Step**：每个步骤职责单一，30-50 行代码
4. **Context**：在各阶段和步骤间传递上下文
5. **补偿逻辑**：失败时释放已预留的资源
6. **Gateway**：通过防腐层隔离外部库存系统

这个流程涉及多个聚合根（用户、商品、库存、优惠券、订单），有明确的业务阶段，因此使用了 Executor/Phase/Step 模式。

---

**以上规范是 AI 编程的核心指南，必须严格遵守。**
