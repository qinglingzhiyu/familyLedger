# 产品评估指标框架 (Metrics Framework) - 家庭记账应用

---

## 1. 指标框架概述

本框架旨在建立一套系统、分层的数据指标体系，用于科学地衡量“家庭记账应用”的健康度、用户价值及商业成功。通过该框架，我们能够：

- **统一目标**: 确保团队对“成功”有统一的、可量化的定义。
- **驱动决策**: 基于数据洞察来指导产品迭代、运营策略和资源分配。
- **评估效果**: 科学评估新功能或市场活动对产品表现的影响。

我们将采用以“北极星指标”为核心，结合“HEART”用户体验模型和“AARRR”用户生命周期模型的综合指标体系。

---

## 2. 北极星指标 (North Star Metric)

**北极星指标是整个产品团队在当前阶段需要共同聚焦的唯一、最重要的指标。**

- ### **指标定义**: **每周共同记账的家庭数量 (Number of Families Collaboratively Recording Transactions Weekly)**

- **计算方式**: 统计在过去7天内，一个家庭账本中至少有2名或以上成员各自产生过记账行为的家庭账本总数。

- **选择依据**:
  - **体现核心价值**: 它直接衡量了产品的核心价值主张——“家庭共享记账”。
  - **反映用户活跃与留存**: 一个家庭持续共同记账，意味着产品对他们有真正的价值，他们很可能会长期留存下来。
  - **预示长期商业成功**: 拥有高粘性的活跃家庭用户是未来商业化（如增值服务）的基础。
  - **驱动团队行为**: 为了提升该指标，产品、开发、运营团队需要协同工作，优化邀请流程、简化记账操作、提升账本的互动性。

---

## 3. HEART 用户体验指标体系

HEART模型从五个维度全面评估用户对产品的体验。

| 维度 | 核心问题 | 目标 | 关键指标 |
| :--- | :--- | :--- | :--- |
| **Happiness (愉悦度)** | 用户对产品满意吗？ | 提升用户满意度和推荐意愿 | - 用户满意度评分 (CSAT)
- 净推荐值 (NPS)
- 应用商店评分 |
| **Engagement (参与度)** | 用户使用产品的频率和深度如何？ | 提升用户在产品内的活跃程度 | - 日/月活跃用户数 (DAU/MAU)
- 平均每用户记账笔数/天
- 核心功能渗透率 (如预算功能使用率、报表查看率) |
| **Adoption (接受度)** | 新用户是否能快速上手并使用核心功能？ | 提升新功能的采纳率 | - 新用户7日内完成首次记账的比例
- 新用户7日内创建/加入家庭账本的比例
- 新功能上线后首周使用率 |
| **Retention (留存率)** | 用户是否会持续使用产品？ | 提升用户的长期留存 | - 次日/7日/30日用户留存率
- **家庭账本留存率** (创建或加入后，在后续N周依然活跃的家庭比例) |
| **Task Success (任务成功率)** | 用户能否高效地完成关键任务？ | 提升核心任务的完成效率和成功率 | - 记账任务平均耗时
- 邀请家庭成员任务的转化率 (从发起邀请到成功加入)
- 关键任务失败率 (如记账失败、邀请失败) |

---

## 4. AARRR 用户生命周期指标

AARRR模型（海盗模型）帮助我们跟踪用户从获取到变现的全过程。

| 阶段 | 核心目标 | 关键指标 |
| :--- | :--- | :--- |
| **Acquisition (获取用户)** | 用户从哪些渠道来？ | - 各渠道新增用户数 (DNU)
- 各渠道获客成本 (CAC)
- 邀请注册转化率 (K-factor) |
| **Activation (激发活跃)** | 用户的“啊哈时刻”(Aha! Moment)是什么？ | - 完成新手引导的用户比例
- **激活标准**: 用户在24小时内成功记录第一笔账，并加入或创建了一个家庭账本。
- 用户激活率 |
| **Retention (提高留存)** | 有多少用户会回来？ | - (同HEART模型中的留存率指标) |
| **Revenue (增加收入)** | 如何从用户身上获取收益？ | - 付费用户转化率
- 每用户平均收入 (ARPU)
- 用户生命周期价值 (LTV) |
| **Referral (病毒传播)** | 用户是否愿意推荐给他人？ | - 每个活跃用户发出的平均邀请数
- 邀请接受率
- 病毒系数 (K-factor) |

---

## 5. 功能级评估指标

针对具体功能，我们也需要设定评估指标来衡量其效果。

| 功能模块 | 衡量指标 |
| :--- | :--- |
| **邀请成员功能** | - 邀请流程各步骤转化率 (点击邀请 -> 发送 -> 对方点击 -> 成功加入)
- 成功邀请一个成员的平均耗时 |
| **预算功能** | - 预算功能使用渗透率
- 成功设置预算的用户比例
- 预算提醒的打开率 |
| **智能记账 (未来)** | - OCR/语音记账的采纳率
- 识别准确率
- 相比手动记账节省的时间 |

---

## 6. 指标监测计划

- **数据采集**: 通过在产品中进行代码埋点来收集用户行为数据。需要与开发团队合作，制定详细的埋点方案。
- **数据看板**: 使用数据分析工具（如自研后台、Google Analytics, Mixpanel等）建立产品核心指标看板。
- **报告周期**:
  - **日报**: 监控核心数据（DAU, 新增, 记账数）的日常波动。
  - **周报**: 回顾周度数据，分析趋势，特别是北极星指标的变化，并同步给核心团队。
  - **月报/季报**: 进行更深入的分析，评估产品健康度，为下一阶段的Roadmap规划提供数据支持。