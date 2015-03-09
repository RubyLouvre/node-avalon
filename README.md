# node-avalon
在后端渲染avalon

后端处理
```html
<ul>
   <li ms-repeat="array">{{el}}</li>
</ul>
```
为
```html
<ul>
  <li ms-skip id="sfdsfd" >aaa</li>
  <li ms-skip id="xxdfsdf">aaa</li>
  <li ms-skip id="sdfdsf">aaa</li>
  <script>
   new function(){
     var nodes = document.getElementsByTagName("script")
     var node = nodes[repeats.length-1]
     var target = node.parentNode
     avalon.innerHTML(target, '<li ms-repeat="array">{{el}}</li>')
   }
  </script>
</ul>
```

后端处理
```html
<ul ms-each="array">
   <li>{{el}}</li>
</ul>
```
为
```html
<ul ms-skip>
  <li>aaa</li>
  <li>aaa</li>
  <li>aaa</li>
</ul><script>
   new function(){
     var nodes = document.getElementsByTagName("script")
     var node = nodes[repeats.length-1]
     var target = node.previousSibling
     var dom = avalon.innerHTML('<ul ms-each="array"><li>{{el}}</li><ul>')
     target.parentNode.replace(dom, target)
   }
 </script>
```
