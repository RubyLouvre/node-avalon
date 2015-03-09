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
```html
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
对于使用了html过滤的插值表达式，如
```html
        <div ms-controller="test">
            {{aaa|html}}
        </div>
        <script type="text/javascript">
            var vm = avalon.define({
                $id: 'test',
                aaa: "<span>dddd</span><span>dddd</span><span>dddd</span>"
            })
        </script>
```
变成
```html
 <div ms-controller="test">
    <!--ms-html123423432--><span>dddd</span><span>dddd</span><span>dddd</span><script>
   new function(){
     var nodes = document.getElementsByTagName("script")
     var node = nodes[repeats.length-1]
     var array = [], target
     while(target = node.previousSibling){
         if(target.nodeType !== 8 && targetNodeValue !== "ms-html123423432"){
             array.push(target)
         }else{
             var comment = target
             break
         }
     }
     var parent = node.parentNode
     while(target = array.shift()){
         parent.removeChild(target)
     }
     var dom = document.createTextNode("{{aaa|html}}")
     parent.replace(dom, comment)
  }    
            </script>
        </div>
        <script type="text/javascript">
            var vm = avalon.define({
                $id: 'test',
                aaa: "<span>dddd</span><span>dddd</span><span>dddd</span>"
            })
        </script>
```

