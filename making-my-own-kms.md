---
title: Making my own KMS
date: 2020-07-06
tags: project, personal development
---
## Preface
This whole thing is my personal experience and is probably an incorrect or ineffective (let alone the code itself being a fucking mess) way of doing things. What may work for me may not work for others. This is why, at least currently, this project will not be available publicly.

Knowledge is important. Saving knowledge is even more important, especially for people like me who have a hard time remembering things sometimes.

In order to assist myself to remember things as well as become more organized, I decided to implement the "second brain" approach of creating a (private) knowledge dump where I will save notes, ideas and code snippets.

## The initial idea
Before I started working on my KMS, I only vaguely knew what I wanted to accomplish thinking my KMS will be a constantly evolving, living thing. That said, I did have something in mind: ease of use and fluid categorization. 

What do I mean by fluid categorization? Opposed to platforms like WordPress that use a set taxonomies, my KMS should have a fluid document relationship - A document can, for example, one day belong to a Code Snippets category and to Project X on another once I actually get to analyze and "categorize" it.

This would be implemented by using a format such as `type:value` in the header. So, like in the aforementioned example, a document can be `category:code-snippets` one day and `project:x` on another.

I called these "links", for now.

## The Stack
Everything is done using HTML, CSS and PHP. JavaScript only exists to enable [highlight.js](https://highlightjs.org/) as well as [EasyMDE](https://github.com/Ionaru/easy-markdown-editor).
In quite a few places JS would make sense (AJAX search, for example), but for the time being I'd like to avoid using JS.

I initially thought of making this a very lightweight system, but as I kept adding things I quickly realized I should start making this into proper object-oriented software. I'm not there yet as (due to not actually being a programmer) I don't quite understand all the concepts yet.

##  Document Format
As I got used to using MarkDown, I have decided to use it for my KMS albeit with some custom properties that were created in order to avoid any sort of database storage of document related information (either relational or flat).

*The reasoning:* This was done so that all the documents are essentially self-contained and that all relevant information is stored in case I decide to switch platforms or in case the documents are viewed externally.
The only thing that is currently contained elsewhere are the link descriptions[^1].

Every document would include a header such as:
```
[[title]] Document Title
[[date]] yyyy-mm-dd
[[link]] type:value
[[description]] Optional description
```
which will be parsed once the document has been read. This means that all links are created on runtime.

After some reading and research (and after creating the lame support for tags), I decided to drop the custom properties and adopted a YAML header instead:
```
---
title: Optional Title (Otherwise first H1)
link: type:value
date: yyyy-mm-dd
description: optional description
tags: comma,delimited,tags
---
```
I quickly learned that I couldn't parse YAML in PHP and would need a library to do so. So I decided, as with many other things, to write my own:
```PHP
private function parse_yaml(string &$str)
{
    $parsed = [];
    preg_match("'---(.+?)---'si", $str, $yaml);
    if (!isset($yaml[0])) return false;
    $str = str_replace($yaml[0], '', $str);
    $parsed['body'] = $str;
    $yaml = trim($yaml[0]);
    preg_match_all("'(\w+):\s?(.+)'m", $yaml, $yaml_attribs, PREG_SET_ORDER);
    foreach ($yaml_attribs as $attribute) {
        $parsed[$attribute[1]] = trim($attribute[2]);
    }
    return (object) $parsed;
}
```
The way I did it is less than ideal, but it works in this scenario which, in turn, is good enough for me.

## Usage
If something is not comfortable to use, you'll stop using it shortly after. This means, especially for me, that comfort is paramount in order to force myself to make recording knowledge a habit.

I started from a local instance running in my computer, which would, obviously, prove to be less then ideal as I couldn't record anything when my computer is either off or when I'm away. This prompted me to upload a copy of the code to my VPS in order to start using it.

This, in turn, brought up the need for a couple more improvements in order to make my KMS more usable:
### Responsive UI
As my KMS has basically no UI and everything is text based, this improvement was easy to implement but at the same time was most likely the most important one to accomplish first.

A couple of CSS rules later and, albeit not the easiest to use, I could use the KMS from my phone as well.

Editing still proves to be a challenge sometimes as, after all, this is not a native application and there's a severe lack of interactivity in the shape of JS.
### Tags
Tags provide one more way to, well, tag documents. For example, a document with the `link: category:recipes` link might have `tags: sweet,easy,quick`.
Currently, tags are very underused and I'm still thinking of the best way to use them appropriately.

*ToDo* - Use tags properly.
### Search
This was a very important task to accomplish as, with time, as the collection of documents grows, finding a particular document or even a piece of information will become harder.

Me being me, instead of relying on things that actually **work**, I decided to write my own scored search system. It's currently still broken and requires a lot of improvement, but it works for the most part.

The results are scored in the following way:
- **Tags** - A tag match is 5 points.
- **Title** - A full title match is 1 point. `similar_text()` is used for partial matches where 55% match and above is 0.5 points and a 75% match and above is 1 point.
- **Content** - A full match returns the word length of the query worth in points (so "quick recipe" will return 2 points). Each separately matched word is 0.25 points.

```PHP
public function find(string $search_string)
{
		$this->search_string = urldecode($search_string);
		$this->results = [];
		foreach ($this->pages as $key => $page) {
			if ($page->tags) {
					$score = $this->check_tags($page->tags, $this->search_string);
			} else {
					$score = 0;
			}
			$score += $this->check_title($page->title, $this->search_string);
			$score += $this->check_content($page->content, $this->search_string);
			if ($score > 0) {
					$page->score = $score;
					$this->results[] = $page;
			}
		}
		return usort($this->results, function ($a, $b) {
				return $b->score <=> $a->score;
		});
}
```

*ToDo* - Optimize the searching and scoring method for more accurate and/or diverse results.

### Internal Links
Internal links had to be implemented through a custom format (`{{@link-slug:optional title}}`) and are parsed at runtime. Someday I will figure out how to do these Wikipedia style (`[[link slug]]`).
```PHP
preg_match_all('/{{@([^:][\w-]+)(?::(.+))?}}/', $data, $intlink_matches, PREG_SET_ORDER);
foreach ($intlink_matches as $match) {
		$data = str_replace($match[0], '<a href="' . DS . $match[1] . '">' . $match[2] ?? $match[1] . '</a>', $data);
}
```

*ToDo* - Perform search on title instead of providing slug manually.
## Ease of use and other things
### Quick Editing
One more thing that prompted me to use a [YAML header](#document-format) instead of custom properties was trying to make the process of creating new documents as easy as possible. This includes providing little to no information besides the content when creating a new document.

For this exact reason, when creating a new document nothing is mandatory: filenames (IDs) are generated using a `Ymdhis` date format (e.g. 20200608023521, similar to ZettelKasten IDs), titles are taken from the first H1 occurrence OR the file ID, the default link is `:inbox` and so on.

*The reasoning:* All these allow me to just write down whatever information I need to record and get back to it later whenever I've got more time or when I have access to my computer.
### Image Upload
One more thing that I figured out I needed was image upload, which, currently is working but is very rudimentary.
The process:
1. File is uploaded via a form using PHP POST.
2. File is renamed to `document-slug_ID.ext` where ID is the last image ID + 1. This will ensure images are still "linked" to their pages even if viewed separately.
3. File is moved to uploads folder.
4. Image is appended in MD format to the page content.
5. Document is saved and reloaded.

This is less than ideal, but again - I'm not using JavaScript.

```PHP
public static function process_image_upload(string $page_name, array $files)
    {
        $allowed_types = [
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
        ];
        $image_extension = pathinfo($files['imageupload']['name'], PATHINFO_EXTENSION);
        if (!array_key_exists($image_extension, $allowed_types) || $allowed_types[$image_extension] != $files['imageupload']['type']) {
            echo 'File type not allowed!';
            return false;
        }
        $last_index = self::get_last_page_image_index($page_name) ?? 0;
        $new_image_name = $page_name . '_' . ($last_index + 1) . '.' . $image_extension;
        if (move_uploaded_file($files['imageupload']['tmp_name'], UPLOAD_PATH . $new_image_name)) {
            return '//' . HOME_URL . DS . UPLOADS_FOLDER . DS . $new_image_name;
        } else {
            echo 'Error uploading image!';
            return false;
        }
    }
```

*The reasoning:* Sometimes, visual representation is required, as in the case with recipes, for example. External image hosting will not do, especially if the KMS is completely internal.

*ToDo* - Resizing and optimizing images post upload.
### Page Relations
Besides the page link (`link: page:page-slug` which basically defines a "sub-document"), I took some inspiration from [Andy Matuschak's Notes](https://notes.andymatuschak.org/About_these_notes?stackedNotes=z21cgR9K3UcQ5a7yPsj2RUim3oM2TzdBByZu) and implemented related documents.

These are also rudimentary and rely on the YAML header, but they work and allow me to link pages together.

*ToDo* - Identify the internal link and create the connection between pages at runtime, instead of having to specify the related documents manually.
### External Links
To quickly add interesting links and resources, my KMS can also be used as a sort of bookmarking system, where I can also give a bookmark it's own context. The only thing that changes, really, is that external links get an extra attribute in the header: `href: https://url`.

## Conclusion
I'm not done. I am still learning what are the best ways to do personal knowledge management as well as how to write proper PHP code.

You might see this post updated in the future once I think of other things :)
[^1]: Descriptions are plaintext strings tied to a link (e.g. ` ":recipes":"Assortment of random recipes. To be categorized."`) and exist in a `descriptions.json` file inside the data folder.
They will be eventually replaced by something called descriptive documents.
