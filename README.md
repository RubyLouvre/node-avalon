# node-avalon
在后端PhantomJS运行一个特殊版本的avalon
1. 它不会移除ms-controller, ms-attr等所有绑定属性
2. 它会在ms-each, ms-repeat, ms-with， ms-include, ms-if, ms-visible, ms-attr, ms-text, ms-html, {{}}
   做特殊处理，动态模板当成静态模板，动态生成的内容尽可能添加ms-skip， 并且后面跟着一个script标签，用
   ID来识别定位，将原元素的内容再复制一下，插在适当位置，让前端avalon再渲染
3. 它不会处理ms-data, ms-on, ms-widget, ms-css, ms-hover, ms-active绑定
4. 它将ms-visible与ms-if视为同一种逻辑
5. ms-each, ms-repeat, ms-with内部不会再生成script标签

<hr/>
<h3>各ms-*在node-avalon的特殊处理</h3>
<h4>ms-repeat</h4>
```html
<ul>
   <li ms-repeat="array">{{el}}</li>
</ul>
```
转换成
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
<h4>ms-each, ms-with</h4>
```html
<ul ms-each="array">
   <li>{{el}}</li>
</ul>
```
转换成
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
<h4>{{prop}} 及 {{prop|html}}</h4>
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
<h4>ms-if及ms-visible</h4>
```html
<span>aaa</span><span ms-if="toggle">{{xxx}}</span><span>bbb</span>
```
转换成
```html
<span>aaa</span><script id="node-avalon334323">
 new function(){
     var node = document.getElementId("node-avalon334323")
     var dom = avalon.parseHTML('<span ms-if="toggle">{{xxx}}</span>')
     node.parentNode.replaceChild(dom, node)
    
</script><span>bbb</span>
```




