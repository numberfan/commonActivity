/**
 * [利用下标索引进行转盘抽奖]
 *
 * html结构：
 * container: ".dailIndex-container"
 * square: ".dail-unit"   attr: dail-id=0 (0,1,2,3,4......)
 * <table border="0" height="310px" width="670px" class="dailIndex-container">
     <tbody>
         <tr>
             <td class="dail-unit" dail-id=0>
                 <p class="info">魔兽世界战网卡</p>
             </td>
             <td class="dail-unit" dail-id=1>谢谢参与</td>
             <td class="dail-unit" dail-id=2>谢谢参与</td>
             <td class="dail-unit" dail-id=3>
                <p class="info">英雄联盟皮肤</p>
             </td>
         </tr>
         <tr>
             <td class="dail-unit" dail-id=9>谢谢参与</td>
             <td colspan="2" class="dail-button">
                 <a href="javascript:;" id="lottery">
                    <p class="main j_main">我要抽奖</p>
                 </a>
             </td>
             <td class="dail-unit" dail-id=4>谢谢参与</td>
         </tr>
         <tr>
             <td class="dail-unit" dail-id=8>谢谢参与</td>
             <td class="dail-unit" dail-id=7>谢谢参与</td>
             <td class="dail-unit" dail-id=6>
                <p class="info">英雄联盟皮肤</p>
             </td>
             <td class="dail-unit" dail-id=5>谢谢参与</td>
         </tr>
     </tbody>
 </table>

 js调用：
 var dd = new DialIndex(".dailIndex-container", {
    originIndex: -1,		//当前转动的位置，起点
    speed: 10,				//初始转动速度，单位ms
    cycle: 20,				//转动基本次数，即完成基本次数后才能进入抽奖环节
    dailUnit: ".dail-unit",	//每一份转盘单元

    onRotateEnd: function(index) {	//转动结束回调，参数为停止位置的dail-id
        console.log("当前的下标为：" + index);
    }
});

 $('.dail-button').click(function(event) {

    //可调用的方法
    dd.stop(parseInt(Math.random()*9));		//停止的位置
    dd.start();								//开始转动
});
 */
;(function() {
	
	var DialIndex = function(container, params) {
		
		var defaults = {
				originIndex: -1,			//当前转动的位置，起点
				speed: 20,					//初始转动速度，单位ms
				cycle: 50,					//转动基本次数，即完成基本次数后才能进入抽奖环节
				dailUnit: ".dail-unit", 	//每一份转盘单元
				//callbacks
				onRotateEnd: function(){},	//转动结束回调
			},
			units = 0,						//总共的节点数
			rotateTimes = 0,				//转动次数
			prizeIndex = 0,					//中奖位置
			nowIndex = 0,					//标记当前为active的节点
			timer = null,					//定时器
			nowSpeed = 0,					//转动速度
			isClick = false,				//已开始转动
			ddi = this;						//DialIndex

		ddi.container = $(container);

		if (!ddi.container.length) {
            console.error("cannot find container");
            return;
        }

		ddi.roll = function() {
			var index = nowIndex;

			ddi.container.find(ddi.opt.dailUnit+'[dail-id='+index+']')
						.removeClass('active');
			index += 1;
			if (index > units-1) {
				index = 0;
			}
			ddi.container.find(ddi.opt.dailUnit+'[dail-id='+index+']')
						.addClass('active');
			nowIndex = index;
			return false;
		};
		ddi.stop = function(index) {
		    //console.log(index)
            var index = (!(typeof index == 'number')|| index < 0 || index > units) ? parseInt(Math.random()*units) : index;
		    //console.log(index);
			prizeIndex = index;
		};
		ddi.rotate = function() {

			rotateTimes += 1;
			ddi.roll();
			if (rotateTimes > ddi.opt.cycle+10 &&
				prizeIndex == nowIndex) {

				isClick = false;

				if (typeof ddi.opt.onRotateEnd == "function") {
                    ddi.opt.onRotateEnd.call(null, prizeIndex);
                }

				clearTimeout(timer);

				prizeIndex = 0;
				rotateTimes = 0;
				nowSpeed = ddi.opt.speed;

			} else {
				if (rotateTimes < ddi.opt.cycle) {
					nowSpeed -= 10;
				} else {
					if (rotateTimes > ddi.opt.cycle && ((prizeIndex==0 && nowIndex==7) || prizeIndex==nowIndex+1)) {
						nowSpeed += 110;
					}else{
						nowSpeed += 20;
					}
				}
				if (nowSpeed<40) {
					nowSpeed=40;
				};

				timer = setTimeout(function() {
					ddi.rotate();
				}, nowSpeed);
			}
			return false;
		};
		ddi.start = function() {

			if (isClick) return;

			if (arguments[0]) {
			    ddi.stop(arguments[0]);
            }

			isClick = true;
			ddi.rotate();
		};
		ddi.init = function() {

            ddi.opt = $.extend({}, defaults, params);
			ddi.dailUnits = $(ddi.opt.dailUnit);

			if (!ddi.dailUnits.length) {
				console.error('cannot find DOM class for dail-unit');
				return;
			}

			ddi.opt.speed = isNaN(ddi.opt.speed) ? 20 : ddi.opt.speed;
			ddi.opt.cycle = isNaN(ddi.opt.cycle) ? 50 : ddi.opt.cycle;

			units = ddi.dailUnits.length;
			nowIndex = ddi.opt.originIndex;
			nowSpeed = ddi.opt.speed;

			ddi.container.find(ddi.opt.dailUnit+'[dail-id='+ddi.opt.originIndex+']')
						.addClass('active');

		};

		ddi.init();
	}; 

	window.DialIndex = DialIndex;

})();