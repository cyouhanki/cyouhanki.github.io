---
title: "C# Small Project Demo"
date: "2020-03-31"
category: "C#"
excerpt: "A Simple Project I Did in 2020, Reviewing It Now for Job Hunting"
---

## A Simple Project I Did in 2020, Reviewing It Now for Job Hunting

The project was built using C# WPF with MySQL database. It uses a simple click-based structure without MVC framework.
To complete a simple project, the key is to have a clear goal and take action.
Put yourself in the user's shoes and make adjustments based on the basics.

Interface + Functionality + Database
That's all you need to complete a simple project.

Then optimize the loading process, control threads, and make further improvements.

## Effects

![Admin Login](../../images/manager-login.gif)

![Guest Login](../../images/cusutom.gif)

## Resource Dictionary Content

```xaml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:local="clr-namespace:WpfApp3">
    <!-- Same XAML code as original -->
</ResourceDictionary>
```

The resource dictionary contains styles that can be statically referenced to modify textboxes, buttons, and other controls. The main focus is on what I wrote. For reference only.

## How to Reference the Resource Dictionary

Find the `App.xaml` file and insert the following. First, my resource dictionary is named `Dictionary1.xaml`:

![Resource Dictionary Reference Example](../../images/xmal.png)

Just enter the content in the red box, where the source content is your resource dictionary name. After that, you can use it globally.

In the next section, I will explain how I set up permissions for different login methods (in a very simple, beginner-friendly way). 