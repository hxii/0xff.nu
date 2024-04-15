---
title: URL Shortener
date: 2020-10-10
tags: hide, project
---
File: `index.php`
Updated: 2020-10-10
```PHP
<?php

namespace hxii;

class fdb
{

    private $filename, $database, $prefix;

    private $dbHeader = '<?php header("HTTP/1.0 404 Not Found");die(); ?>'.PHP_EOL;

    private $authkey = '79A69C0D4B9DFCD94B1BF72799E334D0CC4D1972';

    public function __construct(string $filename, string $prefix)
    {
        $this->filename = $filename;
        $this->prefix = $prefix;
        $this->readDatabase();
    }

    private function initializeDatabase()
    {
        return file_put_contents($this->filename, $this->dbHeader);
    }

    private function readDatabase()
    {
        $this->database = [];
        if (!file_exists($this->filename)) {
            $this->initializeDatabase();
        }
        $rawDatabase = array_slice(file($this->filename), 1);
        foreach ($rawDatabase as $entry) {
            $entry = explode(' ', $entry);
            $this->database[$entry[0]] = trim($entry[1]);
        }
    }

    private function updateDatabase()
    {
        $fh = fopen($this->filename, 'w');
        fwrite($fh, $this->dbHeader);
        foreach ($this->database as $key => $url) {
            fwrite($fh, "{$key} {$url}" . PHP_EOL);
        }
        fclose($fh);
    }

    private function parseRequest()
    {
        $request['request'] = trim($_SERVER['REQUEST_URI'],'/');
        $request['query'] = $_POST;
        if (isset($request['query']['key'])) {
            $request['query']['key'] = $this->prefix.$request['query']['key'];
        }
        return $request;
    }

    public function matchRequest() {
        $request = $this->parseRequest();
        $command = str_replace('@','',$request['request']).'Entry';
        if (is_callable([$this, $command]) && $this->validate()) {
            call_user_func_array([$this, $command], [$request['query']]);
        } else {
            $this->doRedirect($request['request']);
        }
    }

    private function isAuthenticated()
    {
        return isset($_SERVER['PHP_AUTH_PW']) && $this->authkey === $_SERVER['PHP_AUTH_PW'];
    }

    private function validate()
    {
        if (!$this->isAuthenticated()) {
            http_response_code(401);
            die();
        }
        return true;
    }

    private function doesEntryExist(string $entrykey)
    {
        return array_key_exists($entrykey, $this->database);
    }

    private function addEntry(array $entry)
    {
        $entry['key'] = $entry['key'] ?? $this->generateID();
        $this->database[$entry['key']] = $entry['loc'];
        $this->updateDatabase($this->database);
    }

    private function updateEntry(array $entry)
    {
        if ($this->doesEntryExist($entry['key'])) {
            $this->database[$entry['key']] = $entry['loc'];
            $this->updateDatabase($this->database);
        }
    }

    private function removeEntry(array $entry)
    {
        if ($this->doesEntryExist($entry['key'])) {
            unset($this->database[$entry['key']]);
            $this->updateDatabase($this->database);
        }
    }

    private function listEntry()
    {
        $this->response($this->database);
    }

    private function generateID(int $length = 3)
    {
        $id = str_shuffle(base64_encode(microtime()));
        return $this->prefix.substr($id, 0, $length);
    }

    private function doRedirect(string $key)
    {
        if ($this->doesEntryExist($key)) {
            header("Location: {$this->database[$key]}", true, 301);
        } else {
            http_response_code(404);
            die();
        }
    }

    private function response($responseBody)
    {
        header('Content-Type: application/json');
        echo json_encode($responseBody, JSON_PRETTY_PRINT);
    }
}

$fdb = new fdb('db.php', '@');
$fdb->matchRequest();
```
