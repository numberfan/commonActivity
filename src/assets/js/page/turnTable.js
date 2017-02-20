
(function() {

    'use strict';

    var Rotate = function(container, params) {
        var rotatePanelEle = $(container);

        //默认配置
        var defaults = {
            divided: 8,                 //转盘分区
            duration: 1000,             //旋转时间，单位ms
            timeFunction: "ease-out",   //运行速度函数
            delay: 0,                   //动画执行的延迟
            baseAngle: 360*2,          //基础角度
            offsetAngle: 10,            //角度偏移
            onRotateEnd : function() {}//回调函数
        };

        var opt = {},
            nowAngle = 0,           //初始值，默认从0开始旋转
            timer = null,           //定时器
            isRunning = false,
            rotate = this,          //this
            fun = {
                init: function() {},
                setAngle: function() {},            //角度控制在360以内
                getAngle: function () {},           //根据扇区，确定角度
                getSector: function () {},          //根据角度，确定扇区
                getOffsetAngle: function () {},      //控制角度偏移
                getBaseAngle: function() {}         //控制基本圈数
            };

        if (!rotatePanelEle.length) {
            console.error("cannot find container");
            return;
        }

        //角度控制在[0, 360]
        fun.setAngle = function(angle) {
            return angle > 360 ? angle - Math.floor(angle/360)*360 : angle;
        };

        //根据扇区，确定角度
        fun.getAngle = function (sector) {
            var d = 360/opt.divided;
            return Math.random() * (sector - opt.offsetAngle) + (sector-1)*d + opt.offsetAngle;
        };

        //根据角度确定扇区
        fun.getSector = function (angle) {
            var sector = angle % 360,
                d = 360/opt.divided;

            return Math.ceil(sector/d);
        };

        //控制角度偏移
        fun.getOffsetAngle = function(val) {
            var min = 5,
                max = (360/opt.divided)/2 - 5;

            if (val > max || val < min) {
                val = Math.random()*(max-min) + min;
            }
            return val;
        };

        //控制基本圈数
        fun.getBaseAngle = function (val) {
            if (val%360) {
                val = 5;
            }
            return val;
        };

        //初始化
        fun.init = function() {

            opt = $.extend({}, defaults, params);

            //判断参数的合理性
            opt.duration += "ms";
            opt.delay += "ms";
            opt.offsetAngle = fun.getOffsetAngle(opt.offsetAngle);
            opt.baseAngle = fun.getBaseAngle(opt.baseAngle);

        };

        //运行
        rotate.run = function(sector) { //参数为扇区，顺时针
            if(isRunning) {return;} //判断当前是否在运行
            if (!sector) {
                sector = Math.ceil(Math.random()*opt.divided);
            }

            var toAngle = fun.getAngle(sector); //目标角度

            nowAngle += (opt.baseAngle + toAngle);//实际旋转的角度(目标值)
            isRunning = true;

            var transition = ["transform", opt.duration, opt.timeFunction, opt.delay].join(" "),
                timeout = parseInt(opt.duration) + parseInt(opt.delay) + 5;

            rotatePanelEle.css({
                "webkitTransition": transition,
                "mozTransition": transition,
                "msTransition": transition,
                "oTransition": transition,
                "transition": transition,
                "webkitTransform": "rotate(" + nowAngle + "deg)",
                "mozTransform": "rotate(" + nowAngle + "deg)",
                "msTransform": "rotate(" + nowAngle + "deg)",
                "oTransform": "rotate(" + nowAngle + "deg)",
                "transform": "rotate(" + nowAngle + "deg)"
            });

            timer = setTimeout(function() {
                isRunning = false;
                clearTimeout(timer);

                if (typeof opt.onRotateEnd === "function") {
                    var _sector = fun.getSector(nowAngle);
                    opt.onRotateEnd(_sector);
                }
            }, timeout);
        };

        fun.init();
    };

    window.Rotate = Rotate;
})();