# Hybrid Case Study Evaluator

## Overview
This evaluator reads case studies, keypoints, and student answers from `input_data/`, runs a hybrid scorer (embedding cosine + reranker), optionally generates Llama feedback, and writes Excel reports to `output/reports/`.

## Input formats (strict / recommended)
### 1) Case study files
- Location: `input_data/case_study/`
- File type: `.docx`
- Format: case text followed by a "Questions" header (case-insensitive) and numbered questions, e.g.:

