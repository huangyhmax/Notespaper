/*
author:huangyh
date:2017-08-02
实现功能：实现便签功能的外观样式、便签创建、便签删除、便签移动、便签叠加置顶显示
         实现数据保存、删除、初始化
*/
//名字空间模块
var app ={
    util:{},
    // storage:{},/*将数据存储的localstorage部分的内容抽象出来*/
};

//工具方法模块
app.util={
    $:function(selector,node){
        return (node || document).querySelector(selector);
    },
    formatTime:function(ms){  //为什么要有ms这个参数
        var d=new Date(ms);
        var pad=function(s){
            if(s.toString().length===1){  //记得要是转化为string,才能使用length
                s='0'+s;
            }
            return s;
        }
        var year=d.getFullYear();
        var month=d.getMonth()+1;
        var date=d.getDate();

        var hour=d.getHours();
        var minute=d.getMinutes();
        var second=d.getSeconds();

        return year+'-'+pad(month)+'-'+pad(date)+' '+pad(hour)+':'+pad(minute)+':'+pad(second)
    }
};
//storage模块
// app.storage={
//     __storage_key:'__sticky_note__',
//     get:function(id){
//         var notes = this.getNotes();
//         return notes[id] || {};
//     },
//     set:function(id,content){
//         var notes = this.getNotes();
//         if(notes[id]){
//             Object.assign(notes[id],content);
//         }else{
//             notes[id] =content;
//         }
//         localStorage[this.__storage_key] = JSON.stringify(notes);
//         console.log('saved note:id'+id+'content:'+JSON.stringify(content));
//     },
//     getNotes:function(){
//         return localStorage[this.__storage_key] || {};
//     }
// };

// (function(util,storage){
(function(util){
    var $=util.$;
    var moveNote = null;
    var startX;
    var startY;
    var maxZIndex=0;

    var noteTpl='';
    noteTpl += '<i class="u-close"></i>';
    noteTpl += '<div class="u-editor" contenteditable="true"></div>';
    noteTpl += '<div class="u-time"><span>更新:</span><span class="time"></span></div>';  //2017-08-02 9:53
    
    //将便签通过JS实现
    function Note(options){
        var note=document.createElement('div');
        note.className='m-note';
        note.id = options.id || 'm-note'+Date.now();
        note.innerHTML=noteTpl;
        note.style.left=options.left+'px';
        note.style.top=options.top+'px';
        note.style.zIndex=options.zIndex;
        document.body.appendChild(note);
        this.note=note;
        this.updatetime();
        this.addEvent();
    }
    Note.prototype.updatetime = function(ms){
       var ts = $('.time',this.note);
       ms = ms || Date.now();
       ts.innerHTML = util.formatTime(ms);
    }
    //将回调函数给抽离出来，作为一个单独的函数
    Note.prototype.close = function(e){
        console.log(1);
        document.body.removeChild(this.note);
        //这里close是addEvent的回调，没法直接取this.node，隔了一层，所以需要先为close这个方法用bind绑定this
    }
    //进一步完善，关闭之后，移除点击事件
    Note.prototype.addEvent = function(){
        //便签 mousedown事件的监听操作,记录当前是哪个便签需要进行移动
        var mousedownHandler=function (e){
            moveNote = this.note;
            startX=e.clientX-this.note.offsetLeft;
            startY=e.clientY-this.note.offsetTop;
            //计算当前便签的鼠标点击的XY位置
            //console.log(startX)
            //console.log(startY)
            if(parseInt(this.note.style.zIndex)!==maxZIndex-1){
                this.note.style.zIndex=maxZIndex++;
            }
        }.bind(this)
        this.note.addEventListener('mousedown',mousedownHandler);

        //后半部分功能
        // var editor= $('.u-editor',this.note);

        // var inputTimer;

        // var inputHandler=function(e){
        //     var content = editor.innerHTML;
        //     // console.log(content);
        //     /*每300秒存储一次，而不是每输入一个就存储一次，影响性能*/
        //     clearTimeout(inputTimer);
        //     inputTimer = setTimeout(function(){
        //         storage.set(this.note.id,{
        //             content:content
        //         });
        //     }.bind(this),300)
        // }.bind(this);
        // editor.addEventListener('input',inputHandler);  //keyup


        var closeBtn=$('.u-close',this.note);
        var closeHandler=function(e){
            this.close(e);
            closeBtn.removeEventListener('click',closeHandler)
            this.note.removeEventListener('mousedown',mousedownHandler)  //关闭时，也把mousedown事件删除掉
        }.bind(this);
        closeBtn.addEventListener('click',closeHandler)
        //这是最初实现的写法： $('.u-close',this.note).addEventListener('click',this.close.bind(this))
        // $('.u-close',this.note).addEventListener('click',this.close.bind(this))
    }

    //创建事件
    document.addEventListener('DOMContentLoaded',function(e){
        //创建按钮事件
        $('#createnotes').addEventListener('click',function(e){
            // new Note();
            new Note({
                left:Math.round(Math.random()*window.innerWidth-220),
                top:Math.round(Math.random()*window.innerHeight-260),
                zIndex:maxZIndex++
            });
        })
        //对页面document进行鼠标的移动监听
        function mousemoveHandler(e){
            //console.log(e)
            //通过startX和startY取当前便签的XY值this.note.offsetTop
            if(!moveNote){
                return;
            }
            //在document层是取不到this.note以及this.note的xy值的，所以才需要借助moveNote和startX，startY这三个全局变量
            moveNote.style.left = e.clientX-startX +'px';
            moveNote.style.top = e.clientY-startY +'px';
        }
        function mouseupHandler(e){
            moveNote=null;
        }
        document.addEventListener('mousemove',mousemoveHandler)
        document.addEventListener('mouseup',mouseupHandler)

        //初始化notes
        // var notes = storage.getNotes();
        // Object.keys(notes).forEach(function(id){
        //     new Note(Object.assign(notes[id],{
        //         id:id
        //     }))
        // })

    })
// })(app.util,app.storage);
})(app.util);