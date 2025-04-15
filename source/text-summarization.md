---
title: Text Summarization Experiment
tags: project, php
date: 2021-01-17
style: 'font-weight: bold'
---
This text summarization experiment is(/was?) a small weekend experiment I ended up doing following a small improvement I was trying to do for my [KMS project](/making-my-own-kms) involving automatically generating tags for each document, which would hopefully improve search results.

**Note:** While I do believe it will be clear from what you are about to read, but I will mention this regardless - I have no experience in NLP, linguistics, math and algorithms as well as quite limited experience in programming as a whole. Nevertheless, coding is fun and, a fortiori, so is experimenting with silly things such as the above.

**Note 2:** While the results I've been getting are *somewhat* accurate (based on my own testing), this code and it's results probably shouldn't be used in anything mission-critical. I am not responsible for bad grades, AI uprising nor any other mishaps following the usage of the code included hereunder.

There are tools and libraries available online that will do a MUCH better job, but it's just not as fun, is it?

## The gist of it

The code will accept a text (in plaintext format; no HTML) and will try to summarize it in a given amount of sentences based on simple keyword extraction and scoring "algorithm".

## The How

### Keyword Extraction

The process begins with keyword extraction. To do that, we need to break up the entire text by words which I achieve by using this REGEX pattern: `/(\b[a-zA-Z'\-]+\b)/`.
After breaking up the text, I process the keyword array in two steps:

1. Remove stopwords and
2. Merge similar sounding keywords (based on `similar_text()`.

Post-processing, we need to find the frequency of they keywords and remove singular occurrence keywords from the array as they are most likely not the *main* keywords.

### Finding paragraphs and sentences

To find the most *important* bits of the text, we break it down by paragraphs and sentences:

- Find paragraphs by breaking text by two consecutive line endings.
- Find sentences for each paragraph using REGEX `/[.?!\n]/` (Note: I am aware that there are times where a period "." doesn't end a sentence.

### Scoring

The frequency score of a keyword is a good starting point and preliminary filtering to find the potentially defining keywords of the text.
But how do we find out which sentences and paragraphs of the text are the most important?

Through trial and error (and some light reading and research) I came up with the following method of doing just that: when we talk about a subject, we tend to mention the same keywords over and over, and usually towards the beginning of a sentence/paragraph.

1. Find all occurrences of each keyword in each sentence.
2. Each occurrence is scored based on it's distance from the beginning of the sentence multiplied by the keyword's frequency score:
  `Score = (Length of Sentence - Keyword Position) * Keyword Frequency`
  This means that the further the keyword is from the beginning of the sentence, the lower the score is.
3. Sum up all keyword scores into a sentence score.
4. Repeat process for each sentence for each paragraph.
5. Rearrange all sentences based on the score and their position within the text:
  `Final Score = Score * (1 / (Position of Paragraph + Position of Sentence + 1))`
  This is done in line with what I mentioned above that we usually mention the more important things towards the top of a text.
6. Sort the sentences in descending order by the score.

## Result

After getting the sentences back from the script, we can just output the top X sentences (3, for example).

The result turned out to be fairly accurate (given the input text is of decent quality) but obviously there's no artificial intelligence nor machine learning involved in the process so the code and/or ideas presented can obviously be improved.

If you'd like to try it out, a demo is available [here](/p/ts).
The code itself is available on [GitHub](https://github.com/hxii/text_summarizer).
