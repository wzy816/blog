---
title: llm 的 self-reflection
date: 2025-06-13
series: llm
category: writing
draft: true
---

## self-reflection

最近从 deepseek-r1 展开读了不少 reasoning 和 GRPO 的资料。

So about self-reflection， basically it means that during completion especially in learning long chain-of-thought, the model start to generate self-reflection pattern, such as

- Let’s check if we made an error. We should verify the problem conditions again
- Aha! I can use this to get
- Wait, I’m overthinking. Let’s try again

简单的说就是过度内耗地答对。

如果 llm 的基操是你说“问题 a”，它说“blablabla 答案 b”。

那么 self-reflection 的 llm 会说“blablabla 答案 b，等等让我再想想，blablabla 是答案 c；再次检查一下，blablabla 答案 c 是对的。最终答案 c“。

## 实现

我参考了几个开源代码，用 trl 库写了个 grpo 的微调。

### base 模型

> Qwen/Qwen2.5-0.5B-Instruct

因为能“偷到”的卡加起来就这么点显存， peft 没搞定只能全量 finetuning，所以参数量锁死 0.5 B。其中一张卡还给了 vllm 来加速推理。

### 数据集

用了[gsm8k](https://huggingface.co/datasets/openai/gsm8k)，都是英文的超级简单的数学题。

其实[math23k](https://github.com/SCNU203/Math23k/tree/main)也不错。中文数学题，很多师傅、水果、汽车火车，还有海安同济大药房、招宝山郊游、熊猫和动物们比体重比食量。

### system prompt

> “Please reason step by step, and put your final answer within \\boxed{}"

这里参考了论文<https://arxiv.org/abs/2503.20783> 的 qwen template。

不过这论文说，其实要想有 self-reflection，其实 qwen 模型没有 prompt 也 ok，pretrained model 自带 self-reflection。当头一棒 wtf。

wtf 的全称是 what a terrible failure。

### reward function

用了 3 个奖励函数。这里去掉了对 xml 结构的依赖，增加了 aha moment 的捕捉 by keywords。

1. 结果是否是数字
2. 结果是否正确
3. 整个回答是否包含 self-reflection 关键词，例如 "aha", "but wait", "verify the problem", "try again", "let's try", "let's check", "to verify", "recheck"

## 训练

微调的预期是随着 step 增加，模型生成的结果会不断朝着更高的 reward 演进。也就是越来越内耗地答对了。

See [wandb report](https://api.wandb.ai/links/wzy816/4tvjkw27).

Note the blue one with max_completion_length=512 and num_generations=8

## evaluate

Then I run inference on the intermediate models from checkpoints. Each generates 100 response on the question

> A factory produces 2400 widgets in 6 days with 20 workers, working 8 hours per day. If each worker produces the same number of widgets per hour, how many widgets does one worker produce per hour?

then I compare the result with the correct answer 2.5 and find if the correct one has aha moment keywords.

| step  | correct total | correct and has aha moment total |
| ----- | ------------- | -------------------------------- |
| 100   | 32            | 0                                |
| 200   | 27            | 0                                |
| 300   | 33            | 1                                |
| 400   | 16            | 3                                |
| 500   | 30            | 5                                |
| 600   | 25            | 2                                |
| 662   | 26            | 3                                |
| final | 28            | 7                                |

The correctness doesn't change much or even decrease a little. I guess this is due to the model capacity as 0.5B is relatively small. But the number of 内耗答对 is increasing so the training works. 

Here are some response examples. I also highlight the aha moment 

## but wait

but wait, what if I give it a strange reward function?

According to "The Hitchhiker's Guide to the Galaxy", the answer to the "Ultimate Question of Life, the Universe, and Everything" is 42

what if I force the model to reason that correct answer to all questions is 42?

```python
def fourtytwo_award_func(prompts, completions, answer, **kwargs) -> list[float]:
    responses = [completion[0]["content"] for completion in completions]
    return [
        2.0 if extract_boxed_answer(r) == "42" else 0.0 for r in responses
    ]
```