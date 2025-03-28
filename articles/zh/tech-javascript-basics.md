---
title: JavaScript基础知识总结
date: 2024-03-28
category: 技术
excerpt: 本文总结了JavaScript的基本概念，包括变量、函数、对象等核心知识点
---

# JavaScript基础知识总结

## 变量声明

在JavaScript中，我们有三种声明变量的方式：

```javascript
var name = "老张";  // 函数作用域
let age = 25;      // 块级作用域
const PI = 3.14;   // 常量
```

## 函数定义

函数可以通过多种方式定义：

```javascript
// 普通函数
function sayHello(name) {
    return `你好，${name}！`;
}

// 箭头函数
const greet = (name) => `你好，${name}！`;
```

## 对象操作

JavaScript中的对象是键值对的集合：

```javascript
const person = {
    name: '小李',
    age: 30,
    sayHi() {
        console.log(`我是${this.name}`);
    }
};
```

## 总结

JavaScript是一门灵活的语言，掌握好基础概念对于进一步学习至关重要。 