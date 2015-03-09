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
  <li ms-skip>aaa</li>
  <li ms-skip>aaa</li>
  <li ms-skip>aaa</li>
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
<hr/>
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
ms-with同理
<hr/>
ms-text与ms-html照样输出
对于插值表达式
```html
<p>{{xxx}}+{{yyy}}={{xxx+yyy}}</p>

```
转换为
```
<span ms-skip>111</span><script>
 new function(){
     var nodes = document.getElementsByTagName("script")
     var node = nodes[repeats.length-1]
     var target = node.previousSibling
     var dom = document.createTextNode("{{xxx}}")
     target.parentNode.replace(dom, target)
  }
</script><span ms-skip>222</span><script>
 new function(){
     var nodes = document.getElementsByTagName("script")
     var node = nodes[repeats.length-1]
     var target = node.previousSibling
     var dom = document.createTextNode("{{yyy}}")
     target.parentNode.replace(dom, target)
  }
</script>=<span ms-skip>333</span><script>
 new function(){
     var nodes = document.getElementsByTagName("script")
     var node = nodes[repeats.length-1]
     var target = node.previousSibling
     var dom = document.createTextNode("{{xxx+yyy}}")
     target.parentNode.replace(dom, target)
  }
</script>

```



