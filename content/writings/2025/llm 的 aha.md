---
title: llm 的 aha
date: 2025-06-13
series: llm
---

## 内耗地答

Aha moment means that during completion especially in learning long chain-of-thought, the model start to generate self-reflection pattern, such as

- Let’s check if we made an error. We should verify the problem conditions again
- Aha! I can use this to get
- Wait, I’m overthinking. Let’s try again

简单的说就是内耗地答。如果基操是你说“问题 a”，llm 说“blablabla 答案 b”，那么饱含 self-reflection 的 llm 会说“blablabla 答案 b，等等让我再想想，blablabla 是答案 c；再次检查一下，blablabla 答案 c 是对的。最终答案 c“。

当然"内耗地答"不等于"内耗地答对"。

## 实现

我参考了几个开源代码，用 trl 库写了个 grpo 的微调。

base 模型用的 Qwen/Qwen2.5-0.5B-Instruct。因为能“偷到”的卡加起来就这么点显存， peft 没搞定只能全量 finetuning，所以参数量锁死 0.5 B。其中一张卡还给了 vllm 来加速推理。

数据集用了[gsm8k](https://huggingface.co/datasets/openai/gsm8k)，都是英文的超级简单的数学题。不过其实[math23k](https://github.com/SCNU203/Math23k/tree/main)也不错。中文数学题，很多师傅、水果、汽车火车，还有海安同济大药房、招宝山郊游、熊猫和动物们比体重比食量。

system prompt 用的 “Please reason step by step, and put your final answer within \\boxed{}"，这里参考了论文<https://arxiv.org/abs/2503.20783> 的 qwen template。不过这论文说，其实要想有 self-reflection，其实 qwen 模型没有 prompt 也 ok，pretrained model 自带 self-reflection。当头一棒 wtf。wtf 的全称是 what a terrible failure。

reward function 用了 3 个奖励函数。这里去掉了对 xml 结构的依赖，增加了 aha moment 的捕捉 by keywords。

1. 结果是否是数字，奖励 0.5 分
2. 结果是否正确, 奖励 2.0 分
3. 整个回答是否包含 self-reflection 关键词，例如 "aha", "but wait", "verify the problem", "try again", "let's try", "let's check", "to verify", "recheck", 奖励 1.0 分

训练参数，主要设置 max_completion_length=512， num_generations=8。前者不能太短，不然就没有空间 aha。后者也不能太少，毕竟 RL 的精髓是 luck is all you need。

## 训练和 evaluate

微调的预期是模型生成的结果会不断朝着更高的 reward 演进。也就是答对且有 aha moment。

结束后，我在所有的 checkpoint 模型和最终模型上跑了下面这个问题的推理

> A factory produces 2400 widgets in 6 days with 20 workers, working 8 hours per day. If each worker produces the same number of widgets per hour, how many widgets does one worker produce per hour?

生成 100 个回答，和正确答案 2.5 比较判断对错，再分别统计了正确、有 aha moment、 正确且有 aha moment 的总数。可见大概 500 步后没有显著区别，应该是 0.3B 模型能力的原因。

| step  | correct | has aha | correct and has aha |
| ----- | ------- | ------- | ------------------- |
| 100   | 19      | 0       | 0                   |
| 200   | 33      | 0       | 0                   |
| 300   | 25      | 0       | 0                   |
| 400   | 29      | 77      | 27                  |
| 500   | 25      | 95      | 24                  |
| 600   | 22      | 91      | 22                  |
| 700   | 42      | 87      | 39                  |
| 800   | 35      | 85      | 32                  |
| 900   | 30      | 88      | 30                  |
| 1000  | 27      | 88      | 27                  |
| 1100  | 30      | 85      | 29                  |
| 1200  | 33      | 91      | 32                  |
| 1300  | 44      | 87      | 44                  |
| 1400  | 40      | 84      | 38                  |
| 1500  | 41      | 83      | 40                  |
| 1600  | 34      | 82      | 32                  |
| 1700  | 42      | 86      | 41                  |
| 1800  | 46      | 83      | 44                  |
| 1900  | 35      | 87      | 34                  |
| 2000  | 41      | 89      | 41                  |
| 2100  | 46      | 89      | 43                  |
| 2200  | 42      | 90      | 40                  |
| 2300  | 36      | 88      | 34                  |
| 2400  | 38      | 81      | 37                  |
| final | 41      | 86      | 39                  |

Here are some responses generated from final model (aha moment keywords 用了粗斜体)

### wrong, no aha

To determine how many widgets one worker produces per hour, we need to follow these steps:

1. Calculate the total number of widgets produced by all workers in a single day.
2. Determine the production rate for one worker per day.
3. Find out how many widgets one worker produces per hour.

First, let's calculate the total number of widgets produced by all workers in a single day. The factory has 20 workers working 8 hours per day. Therefore, the total number of widgets produced per day is:
\\[
20 \\text{ workers} \\times 8 \\text{ hours/day} = 160 \\text{ widgets/day}
\\]

Next, we know that the factory produces 2400 widgets in 6 days. To find the number of widgets produced per day, we divide the total number of widgets by the number of days:
\\[
\\frac{2400 \\text{ widgets}}{6 \\text{ days}} = 400 \\text{ widgets/day}
\\]

Now, we need to determine how many widgets one worker produces per day. Since there are 20 workers, the daily production rate for one worker is:
\\[
\\frac{400 \\text{ widgets/day}}{20 \\text{ workers}} = 20 \\text{ widgets/day}
\\]

Finally, we need to find out how many widgets one worker produces per hour. There are 24 hours in a day, so the production rate for one worker per hour is:
\\[
\\frac{20 \\text{ widgets/day}}{24 \\text{ hours/day}} = \\frac{5}{6} \\text{ widgets/hour}
\\]

Therefore, the number of widgets one worker produces per hour is:
\\[
\\boxed{\\frac{5}{6}}
\\]

### wrong, has aha

To determine how many widgets one worker produces per hour, we need to follow these steps:

1. Calculate the total number of hours worked by all the workers.
2. Determine the total number of widgets produced by all the workers.
3. Calculate the number of widgets produced per worker per hour.

First, let's calculate the total number of hours worked by all the workers:
\\[
6 \\text{ days} \\times 8 \\text{ hours/day} = 48 \\text{ hours}
\\]

Next, we know that the factory produces 2400 widgets in 48 hours. To find out how many widgets one worker produces per hour, we divide the total number of widgets by the total number of hours worked:
\\[
\\frac{2400 \\text{ widgets}}{48 \\text{ hours}} = 50 \\text{ widgets/hour}
\\]

Therefore, one worker produces \\(\\boxed{50}\\) widgets per hour.

**To verify**, we can also check if the total production fits the daily production rate:
\\[
20 \\text{ workers} \\times 8 \\text{ hours/day} = 160 \\text{ hours/day}
\\]
\\[
\\frac{2400 \\text{ widgets}}{160 \\text{ hours}} = 15 \\text{ widgets/hour}
\\]
This confirms our calculation is correct.

### correct, has aha

To determine how many widgets one worker produces per hour, we need to follow these steps:

1. Calculate the total number of worker-hours worked.
2. Determine the number of widgets produced per worker-hour.
3. Find out how many widgets one worker produces per day.

**Step 1: Calculate the total number of worker-hours worked.**

The factory has 20 workers, working 8 hours per day for 6 days. The total number of worker-hours is:
\\[ 20 \\text{ workers} \\times 8 \\text{ hours/day} \\times 6 \\text{ days} = 960 \\text{ worker-hours} \\]

**Step 2: Determine the number of widgets produced per worker-hour.**

The total number of widgets produced is 2400. So, the number of widgets produced per worker-hour is:
\\[ \\frac{2400 \\text{ widgets}}{960 \\text{ worker-hours}} = 2.5 \\text{ widgets/worker-hour} \\]

**Step 3: Find out how many widgets one worker produces per day.**

Since there are 2400 widgets in a day (the total production), and each worker works 8 hours a day, the number of widgets one worker produces per day is:
\\[ \\frac{2400 \\text{ widgets}}{24 \\text{ hours/day}} = 100 \\text{ widgets/day} \\]

Therefore, the number of widgets one worker produces per hour is \\(\\boxed{2.5}\\).

**To verify**, let's check if 2.5 widgets per worker-hour fits into our total production of 2400 widgets over 2400 worker-hours:
\\[ 2400 \\text{ widgets} / 2.5 \\text{ widgets/worker-hour} = 960 \\text{ worker-hours} \\]
This confirms that our calculation is correct.

### correct, no aha

To determine how many widgets one worker produces per hour, we need to follow these steps:

1. Calculate the total number of widgets produced by all workers in a day.
2. Determine the number of widgets produced per worker per day.
3. Calculate the number of widgets produced per worker per hour.

First, let's find out how many widgets are produced by all workers in a day. The factory has 20 workers working for 8 hours each day. Therefore, the total number of widgets produced by all workers in a day is:
\\[ 20 \\text{ workers} \\times 8 \\text{ hours/day} = 160 \\text{ widgets/day} \\]

Next, we know that the factory produces 2400 widgets in 6 days. So, the number of widgets produced per day is:
\\[ \\frac{2400 \\text{ widgets}}{6 \\text{ days}} = 400 \\text{ widgets/day} \\]

Now, we can find out how many widgets one worker produces per day by dividing the total daily production by the number of workers:
\\[ \\frac{400 \\text{ widgets/day}}{20 \\text{ workers}} = 20 \\text{ widgets/worker/day} \\]

Finally, since each worker works 8 hours a day, the number of widgets produced per worker per hour is:
\\[ \\frac{20 \\text{ widgets/worker/day}}{8 \\text{ hours/day}} = 2.5 \\text{ widgets/hour} \\]

Therefore, the number of widgets one worker produces per hour is:
\\[ \\boxed{2.5} \\]

## aha

这下轮到我来 aha 了。

aha, what if I use a strange reward function?

According to "The Hitchhiker's Guide to the Galaxy", the answer to the "Ultimate Question of Life, the Universe, and Everything" is 42.

所以我编了下面这个reward function，让所有数据题的答案都是42吧。

```python
def fourtytwo_award_func(prompts, completions, answer, **kwargs) -> list[float]:
    responses = [completion[0]["content"] for completion in completions]
    return [
        2.0 if extract_boxed_answer(r) == "42" else 0.0 for r in responses
    ]
```

不过0.5B 参数量显然不够一本正经的内耗，待我用 peft 微调个大的。

且听下回分解。
