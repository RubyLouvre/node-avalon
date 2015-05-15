# node-avalon
这存在两上版本,一个运行于phantom环境,一个运行于nodejs环境

目前先开发nodejs环境的,基于parse5

本项目的宗旨是,在后端就将第一层数据打进页面上,解决SEO问题,前端avalon只是进行绑定对象的重新注入与双向绑定

demo正面的流程
它是用来测试前端avalon与后端avalon的协作

首先在demo下面直接复制attr.js,将里面第一行name的值改成你要测试的指令名,如if,repeat
其次在html目录建你的测试页面(以指令名 命名),这是放在后端运行的,可以参考已有的
再次在script录建你的测试脚本(以指令名 命名),这是前后端共用
最后跑到demo目录,测试你的指令,如node if;它就会在public目录生成真正的页面(这是经过后端avalon扫描后的页面)
这页面里面引用了前端avalon,这时我们测试它的效果,是否能正常运行

我们要做的是,修改string-avalon-src中bindForBrowser与directive中的指令与前端的rebind方法

directive中的指令，需要bindingExecutors.xxx 中加上  bindForBrowser(data)
具体参考attr的例子








