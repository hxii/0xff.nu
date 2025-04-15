---
title: "How-to: Creating a super simple URL shortening service"
tags:
  - project
  - guide
description: "How-to: Creating a super simple URL shortening service without SQL"
date: 2020-10-08
modified_timestamp: 2025-04-15T14:05:01+03:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
You know how they say the best way to learn something is to teach it?
I personally don't have time to participate in something like [100 days of code](https://www.100daysofcode.com/) or anything similar, but that doesn't mean that I shouldn't do *something*, you know?

So today I will explain how I made a super simple URL shortening service for myself and hopefully it will help some of you.

The code is available [**here**](/url-shortener).

**Please note:** This is *my* take on a URL shortener and this whole thing is written as an excercise based on my current level of PHP knowledge, so I may revisit this in the future. This is most likely not the best or most effecient way of doing this. Please keep this in mind while reading this and, of course, I'd love to hear from you if you've got any ideas or suggestions.

## Why do I/you need this?

Traditionally, I guess, URL shorteners were and are used to make long URLs short. These are often used in places where there exists a limit on the character count that can be used such as Twitter, SMS, Mastodon, various descriptions et cetera.
They can also be used to create "nice" links (i.e. `service.tld/mylink` is "nicer" than `somewebsiteonline.tld/service/longlinkgalore?query=yesplease`, right?) and as a way to make sure certain links don't change (e.g. `service.tld/blog` will always point to your blog's address even if you move to a different domain).

## Prerequisites

- I am personally using nginx with a directive that forwards all requests to the index file in case the requested path is not found.

```CONF
location / {
try_files $uri $uri/ /index.php$is_args$args;
}
```

- There is no need for a database as all entries as stored in a file.
- Currently, I am using [Insomnia](https://insomnia.rest/) to add, remove and list entries. There is no GUI.

## The "database"

Instead of using an SQL database that would've indubitably made this more complex than it should be (not by much, but still) we are going to store all entries in a simple file.

To introduce some security, I went with a PHP file that has the following header:

```PHP
<?php header("HTTP/1.0 404 Not Found"); die(); ?>
```

This means, that if the database file is accessed directly it will just return a 404 error.
The entries themselves are stored on an entry per line basis with a single space separator between the key and URL, e.g.:

```
@home https://0xff.nu
```

## The script

The script needs to have a couple of parts in order to work as we want it to:

1. Variables and Init - Where we store and create the things.
2. Database - Reading from and storing to the database file.
3. Router - Routing the request through the correct method.
4. Redirection - The main purpose of this thing - redirecting the request.
5. Management - Creating and deleting entries.

### Variables and Init

We are using a handful of variables:

```PHP
private $filename, $database, $prefix;
private $dbHeader = '<?php header("HTTP/1.0 404 Not Found");die(); ?>'.PHP_EOL;
private $authkey = '79A69C0D4B9DFCD94B1BF72799E334D0CC4D1972';

public function __construct(string $filename, string $prefix)
{
    $this->filename = $filename;
    $this->prefix = $prefix;
    $this->readDatabase();
}
```

- `$filename` - The database filename we initialize the class with.
- `$database` - This is where the database will be stored after it's parsed.
- `$prefix` - Entry prefix, if specified. I am using `@`.
- `$dbHeader` - The header that should be prepended to the database file.
- `$authkey` - Hashed key that should be used to authenticate management commands.
- The contructor method sets the variables with the values given once the class is instantiated.

### Database

```PHP
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
```

- `initializeDatabase()` creates a new file and appends the header to it.
- `readDatabase()` reads the database (or calls to initialize it), parses the entries and stores them into the `$database` variable. The first "entry" is sliced off as it's actually the header (`$dbHeader`).
- `updateDatabase()` updates the database `$filename` with the values from `$database`.

### Router

```PHP
private function parseRequest()
{
    $request['request'] = trim($_SERVER['REQUEST_URI'], '/');
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
```

- `parseRequest()` parses the request that was made from both the URI and POST data.
- `matchRequest()` routes the request through the appropriate method, else we're calling the `doRedirect()` method to try and perform the redirect.

Note the `validate()` method. We use this to make sure the request is authorized:

```PHP
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
```

If the auth key does not match, halt execution and return `401 Unauthorized`.

**Note:** I am using a [basic auth](https://en.wikipedia.org/wiki/Basic_access_authentication) so it's important to use this together with HTTPS to actually be somewhat secure.
You can, of course, implement better security if you wish.

### Redirection

Redirection is very, very simple:

```PHP
private function doRedirect(string $key)
{
    if ($this->doesEntryExist($key)) {
        header("Location: {$this->database[$key]}", true, 301);
    } else {
        http_response_code(404);
        die();
    }
}
```

If the requested key exists in the database, we simply append a `Location` header[^1] which redirects to the location we want.
If it doesn't, we return a `404 Not Found`.

### Management

For management, we have four methods: add, update, remove and list entries:

```PHP
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
```

These are fairly self-explanatory. Each method does the neccessary change and updates the database.
You can also notice that we can create new entries without specifying a key.

If a key is not specified, it will be created by `generateID()` which, in essence, creates an ID of a specified `$length` from a randomized, base64 encoded unix timestamp.
You may notice there's no verification if the generated ID already exists, but this should be easy to add using `doesEntryExist()`.

## Conclusion

This was fairly easy but still a fun to write excercise. I am certain some things can be further simplified or written better to begin with, so I will revisit this little project from time to time to make some adjustments.

This functionality will probably be added to [Saisho](/saisho) or may be on a separate domain, we'll see.

[^1]: Location header: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location>
