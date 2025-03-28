---
title: JavaScriptの基礎知識まとめ
date: 2024-03-28
category: 技術
excerpt: JavaScriptの基本概念、変数、関数、オブジェクトなどの重要なポイントをまとめました
---

# JavaScriptの基礎知識まとめ

## 変数宣言

JavaScriptでは、変数を宣言する方法が3つあります：

```javascript
var name = "田中";  // 関数スコープ
let age = 25;      // ブロックスコープ
const PI = 3.14;   // 定数
```

## 関数定義

関数は複数の方法で定義できます：

```javascript
// 通常の関数
function sayHello(name) {
    return `こんにちは、${name}さん！`;
}

// アロー関数
const greet = (name) => `こんにちは、${name}さん！`;
```

## オブジェクト操作

JavaScriptのオブジェクトはキーと値のペアの集合です：

```javascript
const person = {
    name: '山田',
    age: 30,
    sayHi() {
        console.log(`私は${this.name}です`);
    }
};
```

## まとめ

JavaScriptは柔軟な言語で、これらの基本概念を理解することは、さらなる学習に重要です。 