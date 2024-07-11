---
title: "{{ replace (.Name) "-" " " }}"
date: {{ .Date | time.Format "2006-01-02" }}
---
