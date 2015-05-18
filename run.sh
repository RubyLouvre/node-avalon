#bin/bash
if [ x"$2" != "x" ];then
    gulp
fi
cd demo
if [ x"$1" != "x" ];then
    node test.js $1
fi
cd ../