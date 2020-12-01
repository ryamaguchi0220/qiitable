# Qiitable

[![Build Status](https://travis-ci.com/ryamaguchi0220/qiitable.svg?branch=master)](https://travis-ci.com/ryamaguchi0220/qiitable)
[![NPM version](https://badge.fury.io/js/qiitable.svg)](https://badge.fury.io/js/qiitable)

Qiitable is a Node.JS module to parse [Qiita-like search queries](https://help.qiita.com/ja/articles/qiita-search-options).

This module is perfect for integrating complex search (like Qiita search) into your application.

### Queries

| Type | Example |
| ---- | ------- |
| Query for equality | `user:sampleuser`, `user:"sample user"` |
| Query for not-equality | `-user:sampleuser` |
| Query for values greater than another value | `stocks:>10`, `stocks:>=10` |
| Query for values less than another value | `stocks:<100`, `stocks:<=100` |
| Query for multiple conditions | `tag:JavaScript+created:>=2020-01-01` |

### How to use it?

Install it using:

```
$ npm install qiitable
```

Parse a query string:

```js
var qiitable = require("qiitable");

var query = qiitable.Query('tag:Javascript+created:>=2020-01-01').parse();
```

Filter and customize queries using `QueryBuilder`:

```js
var builder = qiitable.QueryBuilder();

// Define mapping, by default all fields are accepted and piped as string
builder.field('stocks', {
    type: Number
});
builder.field('created', {
    type: Date
});

// Reject a field
builder.reject('email');

// Parse queries (return a Query object)
builder.parse('tag:JavaScript+stocks:>=10created:>=2020-01-01')
```

### Origin

This project started as a fork of [GitbookIO/filterable](https://github.com/GitbookIO/filterable).
