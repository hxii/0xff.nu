---
title: Job Application Pseudo-code Questions
date: 2020-02-16
tags: dayjob
---
Part of my job as a support engineer (Tier 3 Support, whatever that means.. advanced support, in short) includes coming up with things.
Now, some of those things are meant to make someone's life easier and some are there to low-key torment you. I learned something and decided to share this with you.

I've been asked to re-design and update a job interview exam to be more challenging and to evaluate the analytical skill of our candidates.
Having been through similar questions myself, I've decided to include some pseudo-code challenges.

Personally, I never had to write pseudo-code before (in any capacity), so this was a learning curve for me as well. How do I go about presenting an idea or process in an understandable, yet undisclosing, manner? After all, I want **you** to explain to me what this fucking nonsense does, not the other way around.
We've decided on two challenges: a reading excercise and a writing one.

If you'd like, you can give these a go and let me know what you think by <a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#112;&#97;&#117;&#108;&#64;&#103;&#108;&#117;&#115;&#104;&#97;&#107;&#46;&#110;&#101;&#116;">email</a>.
## Reading
The point here is for the applicant to try and understand what the code block does and what is the expected output. This is more of an excercise in logic rather than programming knowledge (although it is very beneficial if you've seen/used code before). I want to see if and how you will handle something you don't know without running for the hills (and we've had candidates just leaving).
```
var lib = [
    'bk3725' => 'Five Shades of White',
    'bk3476' => 'Larry Plotter and the Engineer\'s Pebble',
    'bk3281' => 'The Snitcher',
    'bk4897' => 'The Stitchmaker\'s Guide to the Galaxy 10'
]
sort(lib)
print('Books available')
foreach lib as book => name
  if ( replace('bk', '', book) <= 3500 and substring(book, -1) != 7 )
    unset(lib[book])
  end if
  print(name + ' (' + book + ')')
end foreach
```
Now, I personally use PHP and some Ruby, so maybe that is the reason the abomination above looks like it does. I apologise.
## Writing
Since you're still here, you probably understand pseudo-code or can at least make sense of it. Good.
For the second task I've decided to introduce a bit more complexity, so I actually went ahead and solved it myself in PHP first and only then adjusted the "syntax" to pseudo-code to make sure this can be answered.

Here we were asking the candidate to write a simple savings calculator where the input is:
- The initial deposit
- Monthly contribution
- Annual interest rate
- Duration of savings account
The output should be the account total, total interest and total contribution.

This question requires mostly logic and a basic knowledge of how programming works (in any language, really).
## Results
The point was never to make something hard or unsolvable. I've actually verified that the whole exam (5 questions in total), including the two questions above, can be resolved within the time limit.
We have had people with adequate experience (according to their CVs) leaving the interview with no questions answered, which is less then fucking ideal.

That being said, I am still gathering feedback. After all, this is valuable experience and knowledge for me as well.
