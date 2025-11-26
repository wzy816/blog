---
title: llm 的 journey
date: 2025-09-20
series: llm
---

从开始接触 llm 的 day1 起我就在记录，也伴随着 llm 技术自身的发展。

入门是受 Andrej Karpathy 启发，train toy llm to reverse string 来上手。

| date | log                                                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 2023 |                                                                                                                         |
| 0515 | basic transformer understanding; nanoGPT on shakespear text generation; gpt4all train gptj6B w/ lora; streamlit chatbot |
| 0523 | run inference on llama 7B; finetune alpaca lora                                                                         |
| 0605 | implement rotary position embedding                                                                                     |
| 0701 | implement llm attention                                                                                                 |
| 0702 | implement llm full model                                                                                                |
| 0704 | implement trainer /tokenizer / spm                                                                                      |
| 0705 | start train on anderson fairy tale dataset                                                                              |
| 0710 | download zhwiki data and extract                                                                                        |
| 0714 | extract zhwiki with enwiki, retrain                                                                                     |
| 0717 | change epoch to 2                                                                                                       |
| 0718 | inference on anderson, not good                                                                                         |
| 0719 | 放弃 train on anderson dataset，不收敛; train toy llm to reverse string                                                       |
| 0720 | done                                                                                                                    |

然后受 scaling law 影响，开始研究 base model 训练。用了 wiki 的海量数据。发现靠自己的训练资源其实 scale 远远不够。

| date  | log                                                                                |
| ----- | ---------------------------------------------------------------------------------- |
| 0730 | clean scifi dataset                                                                |
| 0731 | change head dimension, train 2.7B on zhwiki                                        |
| 0803 | 调整各种参数                                                                       |
| 0804 | loss 下不去，调参                                                                  |
| 0806 | 扩大模型参数量到 104M，有点用                                                      |
| 0807 | 推理效果一般                                                                       |
| 0808 | 扩展参数量到 447M，vocab 设为 32000/16000; 调整 lr 和 micro、bs，loss 下降很光滑 |
| 0809 | add gradient checkpoint                                                            |
| 0811 | 设置 2M token per step， training 2x slower                                        |
| 0818 | hypertune on 117M                                                                  |
| 0821 | train done, compare loss and lr                                                    |
| 0828 | 117M lr=3e-4, 1.5B lr=1e-4                                                         |
| 0829 | train 2.4B on zhwiki                                                               |
| 0904 | tune lr, context_size,bsz,micro                                                    |
| 0926 | loss=2.7 下不去了                                                                  |
| 0927 | fix max_seq_len=2024, 国庆节 retrain                                               |
| 1007 | loss=3.5                                                                           |

所以 base model 只能靠开源的。然后 baichuan2 出现了，我觉得可以微调下，于是折腾 lora。
又想到了公司的营销文案业务。但最终生成结果效果一般，数据量太少。
等大厂出了各种领域机器人，包括营销文案生成机器人，就被吊打，果断放弃。

| date  | log                                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| 1007 | run baichuan2-lora with transformer                                                                               |
| 1010 | rewrite baichuan2 model; load model shards done; load tokenizer done                                          |
| 1013 | inference on baichuan2 base model done                                                                            |
| 1019 | rewrite jupyter code to python code; inference ok                                                               |
| 1020 | alibi mask 问题，提 github issue                                                                                  |
| 1024 | inference add repetition penalty and early stop                                                                   |
| 1025 | rewrite alibi mask; 合并 alibi mask 和 attension mask                                                           |
| 1027 | implement lora inject adapter to replace module in base model; change chat dataset to (input_ids，labels，mask) |
| 1107 | start finetune                                                                                                    |
| 1108 | add hyperparam search，delete ray tune                                                                            |
| 1113 | param search                                                                                                      |
| 1211 | belle dataset 不太行; finetune with multiturn dataset                                                           |
| 1215 | 改造 dataset format                                                                                               |
| 1219 | loss=2，下不去                                                                                                    |
| 2024  |                                                                                                                   |
| 0104 | retrain， fix 数据集问题，loss=1.82，推理效果不错                                                                 |
| 0115 | streamlit chat app done                                                                                           |
| 0130 | 设计营销文案生成 bot                                                                                              |
| 0220 | finetune baichuan3 13B + lora on multiturn                                                                        |
| 0221 | retrain v2                                                                                                        |
| 0222 | retrain v3                                                                                                        |
| 0308 | retrain v4 done                                                                                                   |

中间半年我也不记得我忙啥去了。24 年下半年开始有几个业务上的 idea，开始研究单机多卡推理。做了无数开源模型的推理 demo，最后也成功上线到了公司的业务。

| date  | log                             |
| ----- | ------------------------------- |
| 1112 | fsdp train on mnist             |
| 1113 | fsdp add wandb log              |
| 1114 | read fsdp paper; get molmo 7B |
| 1115 | molmo 7B inference done         |
| 1120 | molmo optimize pipeline         |
| 1122 | streamlit demo done             |
| 1123 | 学习 DP，DDP，NMP，PP，TP，2D，3D       |
| 1125 | deepseed not working            |
| 1202 | torchrun 多进程单机多卡推理 done         |
| 1203 | qwen2-VL-7B-instruct demo done  |
| 1204 | llama-3.2-11B-vision demo done  |
| 1206 | llava demo done                 |

2025 年自然是被 deepseek 带动，研究强化学习 grpo 微调。搞定了小模型的多卡微调，最终停滞在多卡上跑 big model。

| date  | log                                                                                           |
| ----- | --------------------------------------------------------------------------------------------- |
| 2025  |                                                                                               |
| 0211 | read deepseek r1 paper; qwen2.5-0.5B with GRPO, but oom                                     |
| 0212 | read deepseek v2 paper                                                                        |
| 0217 | read deepseek v3、math、janus paper                                                           |
| 0227 | janus inference done 效果一般                                                                 |
| 0311 | janus pro 7B inference done; multimodal understanding done; text to image generation done |
| 0424 | llama.cpp build and deploy                                                                    |
| 0606 | qwen2.5 0.5B + grpo on gsm8k done; full param finetuning                                    |
| 0613 | grpo inference to witness aha moment                                                          |
| 0619 | start peft+vllm+grpo                                                                          |
| 0806 | grpo+peft+qwen2.5 3B+gsm8k done                                                               |
| 0813 | start grpo with custom reward                                                                 |
| 0903 | grpo with custom reward done                                                                  |
| 0904 | start qwen2.5 7B+peft+trl                                                                     |
| 0910 | 先不搞了                                                                                      |
