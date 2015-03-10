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
  <script id="node-avalon2123223">
   new function(){
     var target = document.getElementId("node-avalon2123223")
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
</ul><script id="node-avalon255223">
   new function(){
     var node = document.getElementId("node-avalon255223")
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
<span ms-skip>111</span><script id="node-avalon11113">
   new function(){
     var node = document.getElementId("node-avalon11113")
     var target = node.previousSibling
     var dom = document.createTextNode("{{xxx}}")
     target.parentNode.replace(dom, target)
  }
</script><span ms-skip>222</span><script id="node-avalon11114">
   new function(){
     var node = document.getElementId("node-avalon11114")
     var target = node.previousSibling
     var dom = document.createTextNode("{{yyy}}")
     target.parentNode.replace(dom, target)
  }
</script>=<span ms-skip>333</span><script id="node-avalon11115">
   new function(){
     var node = document.getElementId("node-avalon11115")
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
    <!--ms-html123423432--><span>dddd</span><span>dddd</span><span>dddd</span><script id="node-avalon32343">
   new function(){
     var node = document.getElementId("node-avalon32343")
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
<p>这样会导致在循环绑定生产生大量script标签,因此在node-avalon中,绑定绑定里面的绑定不会再产生绑定</p>
<hr/>

ms-if
```html
<span>aaa</span><span ms-if="toggle">{{xxx}}</span><span>bbb</span>
```
生成
```html
<span>aaa</span><script id="node-avalon334323">
 new function(){
     var node = document.getElementId("node-avalon334323")
     var dom = avalon.parseHTML('<span ms-if="toggle">{{xxx}}</span>')
     node.parentNode.replaceChild(dom, node)
    
</script><span>bbb</span>
```




