# Introduction

Tale as old as time. I started developing a new static site for
[patchbay.pub](https://patchbay.pub/). At first it was just a single page. But
of course eventually I needed to add a header. And of course HTML doesn't have
a way to
[include another HTML file](https://css-tricks.com/the-simplest-ways-to-handle-html-includes/),
because why would that be useful?

tuplates is a simple way to template your static sites, without creating a
dependency on your templating tool. Rather than replacing your template tags,
it works by replacing lines between your template tags. This means that both
your template and code live together in your files. When you need to make a 
change, you update the fragment and re-run tuplates, and it replaces the old
code. This way you can check your actual code into source control, rather than
your templates.


# Installation

```bash
npm install -g tuplates
```


# Usage

Create a `tuplates` directory containing your fragments as files. You can
name them whatever you want.

```
project_directory/
  index.html
  index.js
  tuplates/
    header.html
    footer.html
    data.txt
```

Insert tuplate tags as comments in your code:

```html
<!-- index.html -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
  </head>

  <body>
    <!-- tuplate_start(header.html) -->
    <!-- tuplate_end() -->

    <main>
    </main>

    <!-- tuplate_start(footer.html) -->
    <!-- tuplate_end() -->

  </body>

</html>
```

```javascript
// index.js
const data =
  // tuplate_start(data.txt)
  // tuplate_end()
;

```

Run the `tuplates` command in the directory above the `tuplates` directory.
It will walk the directory and replace the lines between the tags with the
tuplates.
