---
title: Picoblog API
tags: hide, microblog
date: 2021-01-18
description: Picoblog is a super simple frontend for a microblog (picoblog or twtxt format) with Markdown support
---
This is a (VERY) simple and rudimentary API for [Picoblog](/picoblog). It requires much work so, for now, this page is hidden and will be constantly updated.
**Note:** If you're planning on using this, take note of the above!

```PHP
<?php

class mblogapi {

    private $key = "YOUR_SUPER_SECRET_KEY_HERE";

    private $post, $sourceFile;

    public function __construct(string $sourceFile)
    {
        $this->sourceFile = $sourceFile;
        $this->post = json_decode(file_get_contents('php://input'));
        $this->handleRequest();
    }

    private function handleRequest() {
        if ($this->post->key === $this->key) {
            if ($id = $this->writeEntry()) {
                http_response_code(200);
                header('Content-Type: application/json');
                print(json_encode(['id'=>$id], JSON_PRETTY_PRINT));
            } else {
                http_response_code(500);
            }
        } else {
                print_r(json_encode($this->post, JSON_PRETTY_PRINT));
            http_response_code(401);
        }
        die();
    }

    private function ret($data) {
        print_r($data);
    }

    private function generateID() {
        return substr(str_shuffle(md5(time())),0,6);
    }

    private function writeEntry() {
        if (is_file($this->sourceFile)) {
            $id = $this->generateID();
            $date = gmdate('Y-m-d\TH:i:s\Z');
            $entry = str_replace(["\n", "\r"], '', $this->post->entry);
            $entry = "{$date}   {$id}   {$entry}";
            $src = fopen($this->sourceFile, 'r+');
            $dest = fopen('php://temp', 'w');
            fwrite($dest, $entry . PHP_EOL);

            stream_copy_to_stream($src, $dest);
            rewind($dest);
            rewind($src);
            stream_copy_to_stream($dest, $src);

            fclose($src);
            fclose($dest);
            return $id;
        }
        return false;
    }

}

$api = new mblogapi('blog.txt');
```