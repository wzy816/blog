---
title: "{{ replace (.Name) "-" " " }}"
date: {{ .Date | time.Format "2006-01-02" }}
lastmod: {{ .Date | time.Format "2006-01-02" }}
tags: []
draft: true
---
