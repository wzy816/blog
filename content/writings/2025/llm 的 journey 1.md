---
title: llm 的 journey 1
date: 2025-09-20
series: llm
---

从开始接触 llm 的 day1 起我就在记录，也伴随着 llm 技术自身的发展。

入门是受 Andrej Karpathy 启发，train toy llm to reverse string 来上手。

| date          | log                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2023<br>05-15 | basic transformer understanding<br>nanoGPT on shakespear text generation<br>gpt4all train gptj6B w/ lora<br>streamlit chatbot |
| 05-23         | run inference on llama 7B<br>finetune alpaca lora                                                                             |
| 06-05         | implement rotary position embedding                                                                                           |
| 07-01         | implement llm attention                                                                                                       |
| 07-02         | implement llm full model                                                                                                      |
| 07-04         | implement trainer /tokenizer / spm                                                                                            |
| 07-05         | start train on anderson fairy tale dataset                                                                                    |
| 07-10         | download zhwiki data and extract                                                                                              |
| 07-14         | extract zhwiki with enwiki, retrain                                                                                           |
| 07-17         | change epoch to 2                                                                                                             |
| 07-18         | inference on anderson, not good                                                                                               |
| 07-19         | 放弃 train on anderson dataset，不收敛<br>train toy llm to reverse string                                                     |
| 07-20         | done                                                                                                                          |

然后受 scaling law 影响，开始研究 base model 训练。用了 wiki 的海量数据。发现靠自己的训练资源其实 scale 远远不够。

| date  | log                                                                              |
| ----- | -------------------------------------------------------------------------------- |
| 07-30 | clean scifi dataset                                                              |
| 07-31 | change head dimension, train 2.7B on zhwiki                                      |
| 08-03 | 调整各种参数                                                                     |
| 08-04 | loss 下不去，调参                                                                |
| 08-06 | 扩大模型参数量到 104M，有点用                                                    |
| 08-07 | 推理效果一般                                                                     |
| 08-08 | 扩展参数量到 447M，vocab 设为 32000/16000，调整 lr 和 micro、bs，loss 下降很光滑 |
| 08-09 | add gradient checkpoint                                                          |
| 08-11 | 设置 2M token per step， training 2x slower                                      |
| 08-18 | hypertune on 117M                                                                |
| 08-21 | train done, compare loss and lr                                                  |
| 08-28 | 117M lr=3e-4, 1.5B lr=1e-4                                                       |
| 08-29 | train 2.4B on zhwiki                                                             |
| 09-04 | tune lr, context_size,bsz,micro                                                  |
| 09-26 | loss=2.7 下不去了                                                                |
| 09-27 | fix max_seq_len=2024, 国庆节 retrain                                             |
| 10-07 | loss=3.5                                                                         |

所以 base model 只能靠开源的。然后 baichuan2 出现了，我觉得可以微调下，于是折腾 lora。
又想到了公司的营销文案业务。但最终生成结果效果一般，数据量太少。
等大厂出了各种领域机器人，包括营销文案生成机器人，就被吊打，果断放弃。

| date          | log                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| 10-07         | run baichuan2-lora with transformer                                                                               |
| 10-10         | rewrite baichuan2 model<br>load model shards done<br>load tokenizer done                                          |
| 10-13         | inference on baichuan2 base model done                                                                            |
| 10-19         | rewrite jupyter code to python code<br>inference ok                                                               |
| 10-20         | alibi mask 问题，提 github issue                                                                                  |
| 10-24         | inference add repetition penalty and early stop                                                                   |
| 10-25         | rewrite alibi mask<br>合并 alibi mask 和 attension mask                                                           |
| 10-27         | implement lora inject adapter to replace module in base model<br>change chat dataset to (input_ids，labels，mask) |
| 11-07         | start finetune                                                                                                    |
| 11-08         | add hyperparam search，delete ray tune                                                                            |
| 11-13         | param search                                                                                                      |
| 12-11         | belle dataset 不太行<br>finetune with multiturn dataset                                                           |
| 12-15         | 改造 dataset format                                                                                               |
| 12-19         | loss=2，下不去                                                                                                    |
| 2024<br>01-04 | retrain， fix 数据集问题，loss=1.82，推理效果不错                                                                 |
| 01-15         | streamlit chat app done                                                                                           |
| 01-30         | 设计营销文案生成 bot                                                                                              |
| 02-20         | finetune baichuan3 13B + lora on multiturn                                                                        |
| 02-21         | retrain v2                                                                                                        |
| 02-22         | retrain v3                                                                                                        |
| 03-08         | retrain v4 done                                                                                                   |

中间半年我也不记得我忙啥去了。24 年下半年开始有几个业务上的 idea，开始研究单机多卡推理。做了无数开源模型的推理 demo，最后也成功上线到了公司的业务。

| date  | log                               |
| ----- | --------------------------------- |
| 11-12 | fsdp train on mnist               |
| 11-13 | fsdp add wandb log                |
| 11-14 | read fsdp paper<br>get molmo 7B   |
| 11-15 | molmo 7B inference done           |
| 11-20 | molmo optimize pipeline           |
| 11-22 | streamlit demo done               |
| 11-23 | 学习 DP，DDP，NMP，PP，TP，2D，3D |
| 11-25 | deepseed not working              |
| 12-02 | torchrun 多进程单机多卡推理 done  |
| 12-03 | qwen2-VL-7B-instruct demo done    |
| 12-04 | llama-3.2-11B-vision demo done    |
| 12-06 | llava demo done                   |

2025 年自然是被 deepseek 带动，研究强化学习 grpo 微调。搞定了小模型的多卡微调，最终停滞在多卡上跑 big model。

| date          | log                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------- |
| 2025<br>02-11 | read deepseek r1 paper<br>qwen2.5-0.5B with GRPO, but oom                                     |
| 02-12         | read deepseek v2 paper                                                                        |
| 02-17         | read deepseek v3、math、janus paper                                                             |
| 02-27         | janus inference done 效果一般                                                                     |
| 03-11         | janus pro 7B inference done<br>multimodal understanding done<br>text to image generation done |
| 04-24         | llama.cpp build and deploy                                                                    |
| 06-06         | qwen2.5 0.5B + grpo on gsm8k done<br>full param finetuning                                    |
| 06-13         | grpo inference to witness aha moment                                                          |
| 06-19         | start peft+vllm+grpo                                                                          |
| 08-06         | grpo+peft+qwen2.5 3B+gsm8k done                                                               |
| 08-13         | start grpo with custom reward                                                                 |
| 09-03         | grpo with custom reward done                                                                  |
| 09-04         | start qwen2.5 7B+peft+trl                                                                     |
| 09-10         | 先不搞了                                                                                          |
