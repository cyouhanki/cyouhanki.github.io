---
title: "JavaScript Basics: A Comprehensive Guide"
date: 2024-03-28
category: Technology
excerpt: A comprehensive guide to JavaScript fundamentals, covering variables, functions, and objects
---

# JavaScript Basics: A Comprehensive Guide

## Variable Declaration

In JavaScript, we have three ways to declare variables:

```javascript
var name = "John";  // Function scope
let age = 25;      // Block scope
const PI = 3.14;   // Constant
```

## Function Definitions

Functions can be defined in multiple ways:

```javascript
// Regular function
function sayHello(name) {
    return `Hello, ${name}!`;
}

// Arrow function
const greet = (name) => `Hello, ${name}!`;
```

## Object Operations

Objects in JavaScript are collections of key-value pairs:

```javascript
const person = {
    name: 'Alice',
    age: 30,
    sayHi() {
        console.log(`I am ${this.name}`);
    }
};
```

## Summary

JavaScript is a flexible language, and understanding these basic concepts is crucial for further learning. 