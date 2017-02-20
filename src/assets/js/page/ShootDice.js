/*
	[shootDice 掷骰子]
	param container 游戏容器（必填）
	param params 参数配置（可选）

	Html结构：
	<div class="map-container">
		<div class="map-role"></div>
		<div class="map-wrapper">
			<div class="map-repeat" map-id=1></div> <!--map-id从1开始-->
			<div class="map-repeat" map-id=2></div>
			<div class="map-repeat" map-id=3></div>
		</div>
		<div class="map-dice" style="background-image: url(assets/images/map-dice.png);"></div>
		<button class="map-button">掷骰子</button>
	</div>

	examples:
	var sd = new ShootDice(".map-container", {
		speed: 800, //主角移动每一个所需的时间，默认为800ms
		diceTime: 1000, //骰子转动时间，默认为1000ms
		roleOffsetX: -50, //X轴偏移量，默认为0
		roleOffsetY: -10, //y轴偏移量，默认为0
		mapWrapperClass: ".map-wrapper", //地图容器
		mapRoleClass: ".map-role", //待移动的主角
		mapDiceImgClass: ".map-dice-img", //骰子图片（只能为img节点）
		mapStartBtnClass: ".map-button", //游戏开始按钮，即启动骰子转动按钮
		mapEachSauare: ".map-repeat", //组成地图的每一块
		onGameInit: function() {
			console.log("Game Start!");
		},
		onClickBtnStart: function() {
			console.log("Click Start!");
		},
		onClickBtnEnd: function(val) { //当前骰子数
			console.log("Click the btn!nums:" + val);
		},
		onRoleMoveEnd: function(val) { //当前骰子数
			console.log("Role Move End!nums:" + val);
		},
		onMapEnd: function(val) { //当前骰子数
			console.log("Arrive End!nums:" + val);
			alert("Game Over!");
		}
	});
	
	//可用参数
	sd.canClickStartBtn = false;//是否能点击转动骰子的按钮，true为可以
	sd.diceNum = 1; //期望骰子转动的数目（1~6）

	//可用方法
	sd.setRolePosition(val); //期望人物移动到map-id
	sd.resetGame(); //重置游戏
*/
;(function() {

	var MapRoute = function(container, params) {

		this.container = $(container);

		var defaults = {
				mapWrapperClass: ".map-wrapper",	//地图容器
				mapRoleClass: ".map-role",			//待移动地主角
				mapEachSauare: ".map-repeat",		//每一块地图
				roleOffsetX: 0,						//X轴偏移量
				roleOffsetY: 0,						//y轴偏移量
				speed: 10,							//移动一格的速度
				onRoleMoveEnd: function() {},		//人物移动结束
				onMapEnd: function() {},			//到达终点
				_roleMoveEnd: function() {},		//人物移动结束回调（私有）
			},
			opt = $.extend({},defaults, params),
			mapDatas = [],							//存放地图DOM节点数据
			mr = this;								//MapRoute

		mr.opt = opt;								//配置参数
		mr.wrapperEle = $(container).find(this.opt.mapWrapperClass);
		mr.mainRole = $(container).find(this.opt.mapRoleClass);

		//mapDatas
		mr.getMap = function() {
			if (!mr.wrapperEle) {
				console.error("cannot find id for DOM map-wrapper node");
				return;
			}

			var wrapperEle = mr.wrapperEle,
				divEles = wrapperEle.find(this.opt.mapEachSauare),
				arr = [];

			$.each(divEles, function(index, val) {
				var valEle = $(val),
					mapId = valEle.attr('map-id');
				if (!mapId) {
					console.error("cannot find id for DOM map-repeat node'");
				}
				arr.push({
					mapId: mapId,
					top: valEle.position().top,
					left: valEle.position().left
				});
			});

			return arr;
		};

		//获取mapDatas极值
		mr.getIdRange = function() {
			if (!mapDatas) {
				mapDatas = this.getMap();
			}

			var min = 1,
				max = 10,
				i = 0;

			for (i = 0; i < mapDatas.length; i++) {
				if (mapDatas[i].mapId < min) {
					min = mapDatas[i].mapId;
				} else if (mapDatas[i].mapId > max) {
					max = mapDatas[i].mapId;
				}
			}

			return {
				min: min,
				max: max
			};
		};

		//主角定位
		mr.setRolePosition = function(val) {
			var roleEle = mr.mainRole,
				wrapperEle = mr.wrapperEle;

			if (!val || isNaN(val)) {
				console.error("cannot find the parameter val or val is not Number");
				return;
			}
			if (!roleEle) {
				console.error("cannot find id for DOM map-role node");
				return;
			}

			var aimVal = parseInt(val), //目标值

				//地图map-id的范围
				range = this.getIdRange(), 
				minId = range.min, 
				maxId = range.max,

				self = this,
				timer = null,
				speed = this.opt.speed || 800,

				//当前主角的mao-id,移动的起点
				stepId = parseInt(roleEle.attr('map-id')); 

			if (aimVal < minId) {

				aimVal = minId;

			} else if (aimVal > maxId) {

				aimVal = maxId;

			}

			stepId = isNaN(stepId) ? 0 : stepId;

			timer = setInterval(function() {

				//超出map-if范围，或者到达目标map-id
				if (stepId > maxId || stepId < 0 || stepId == aimVal) {

					clearInterval(timer);

					self.opt._roleMoveEnd();
					self.opt.onRoleMoveEnd(aimVal);

					//到达终点
					if (stepId >= maxId) {
						self.opt.onMapEnd();
					}
				} else {

					if (stepId < aimVal) { //前进
 						stepId++;
					} else if(stepId > aimVal) { //后退
						stepId--;
					}

					var aimEle = wrapperEle.find(self.opt.mapEachSauare + '[map-id='+stepId+']');
					roleEle.css({
						top: aimEle.position().top + self.opt.roleOffsetY,
						left: aimEle.position().left + self.opt.roleOffsetX
					});
					roleEle.attr('map-id', stepId);
				}
			}, speed);
		};

		//初始化
		mr.init = function() {
			var containerEle = mr.container,
				wrapperEle = mr.wrapperEle,
				roleEle = $(container).find(this.opt.mapRoleClass);

            mr.opt.roleOffsetX = isNaN(mr.opt.roleOffsetX) ? 0 : mr.opt.roleOffsetX;
            mr.opt.roleOffsetY = isNaN(mr.opt.roleOffsetY) ? 0 : mr.opt.roleOffsetY;

			containerEle.css('position', 'relative');
			wrapperEle.css('position', 'absolute');
			containerEle.find(this.opt.mapRoleClass).css('position', 'absolute');
			roleEle.attr('map-id', 0);

			mapDatas = this.getMap();
		};

		mr.init();
	};

	//掷骰子
	var ShootDice = function(container, params) {

		//默认参数
		var defaults = {
				speed: 800,						//人物移动一格的时间
				diceTime: 1000,					//骰子转动时间
				mapRoleClass: ".map-role",		//待移动的主角
				mapDiceClass: ".map-dice",		//骰子
				mapStartBtnClass: ".map-button",//游戏开始按钮

				//callbacks
				onGameInit: function() {},		//游戏开始前
				onClickBtnStart: function() {},	//触发游戏开始按钮之前
				onClickBtnEnd: function() {},	//触发游戏开始按钮之后
			},
			opt = $.extend({},defaults,params),
			sd = this; 							//shootDice
			
		sd.opt = opt; //配置参数
			
		var	_canClick = true,				//是否能点击摇骰子的按钮
			_roleOriginPosX = 0,			//主角初始位置
			_roleOriginPosY = 0,
			mr = new MapRoute(container, {	//new MapRounte
				speed: this.opt.speed, 
				onRoleMoveEnd: this.opt.onRoleMoveEnd,
				onMapEnd: this.opt.onMapEnd,
				roleOffsetX: this.opt.roleOffsetX,
				roleOffsetY: this.opt.roleOffsetY,
				_roleMoveEnd: function() {
					_canClick = true;
				}
			});
		
		sd.canClickStartBtn = true;			//是否能点击摇骰子的按钮（公有）
		sd.diceNum = 1;						//指定骰子点数（1~6）
		sd.diceBox = $(container).find(this.opt.mapDiceClass);	//骰子DOM节点
		sd.diceBtn = $(this.opt.mapStartBtnClass); 				//开始按钮
		sd.mainRole = $(container).find(this.opt.mapRoleClass);	//待移动的DOM节点

		//定位主角
		sd.setRolePosition = function(val) {
			if (!val || isNaN(val)) {
				console.error("cannot find the parameter val or val is not Number");
				return;
			}
			_canClick = false;
			mr.setRolePosition(val);
		};

		//定义骰子转动数
		sd.setDiceNums = function(val) {
			if (!val || isNaN(val)) {
				console.error("cannot find the parameter val or val is not Number");
				return;
			}

			if (val < 1 || val > 6) {
				val = Math.ceil(Math.random()*6);
				sd.diceNum = val;
			}

			var basics = 81, //骰子位置基数
		        time = sd.opt.diceTime || 1000, //执行时长ms
		        lastNum = 6, //保存上次的结果，防止重复
		        posY = 0,
		        nowDice = val-1,
		        box = sd.diceBox;   //骰子盒子

		    //切换位置
		    var switchTime = setInterval(function () {
		        posY = basics * lastNum ++;
		        posY = '0 -'+ posY + 'px';
		        box.css('backgroundPosition', posY);
		        if(lastNum >= 10){
		            lastNum = 6;
		        }
		    }, 70);

		    setTimeout(function () {
		        posY = nowDice * basics;
		        posY = '0 -'+ posY + 'px';
		         box.css('backgroundPosition', posY);
		        clearInterval(switchTime);
		    },time);
		};

		//用户事件
		sd.userEvent = function() {
			var self = this,
				diceBtn = sd.diceBtn,
				diceEle = sd.diceBox,
				mainRole = sd.mainRole,
				timer = null,
				lastDiceNum = sd.diceNum,
				nowAllNums = 0,
				_nowDiceNum = 0;

			diceBtn.click(function(event) {
				
				self.opt.onClickBtnStart();

				if (!_canClick || !sd.canClickStartBtn) return;

				if (sd.diceNum < 1 || sd.diceNum > 6 || lastDiceNum==sd.diceNum) {

					sd.diceNum = Math.ceil(Math.random()*6);

				}

				_nowDiceNum = parseInt(mainRole.attr('map-id'));
				nowAllNums = _nowDiceNum + sd.diceNum; //更新目标数
				lastDiceNum = sd.diceNum; //更新上次的骰子数
				sd.setDiceNums(sd.diceNum); //设置骰子数

				self.opt.onClickBtnEnd(sd.diceNum);

				timer = setTimeout(function() {

					mr.setRolePosition(nowAllNums);
					clearTimeout(timer);

				}, self.opt.diceTime);

				_canClick = false;
			});
		};

		//重置游戏
		sd.resetGame = function() {
			var dicebox = sd.diceBox,
				mainRole = sd.mainRole;

			mainRole.css({
				top: _roleOriginPosY,
				left: _roleOriginPosX
			});
			mainRole.attr('map-id', 0);
			dicebox.css('backgroundPosition', '0 0');

			_canClick = true;
			sd.canClickStartBtn = true;
		};

		sd.init = function() {
			var dicebox = sd.diceBox,
				mainRole = sd.mainRole;

			sd.opt.speed = isNaN(sd.opt.speed) ? 800 : sd.opt.speed;
			sd.opt.diceTime = isNaN(sd.opt.diceTime) ? 1000 : sd.opt.diceTime;

			dicebox.css({
				width: "82px",
				height: "82px",
				overflow: "hidden",
				backgroundPosition: "0 0",
				backgroundRepeat: "no-repeat"
			});
			this.userEvent();
			this.opt.onGameInit();

			_roleOriginPosX = mainRole.position().left;
			_roleOriginPosY = mainRole.position().top;
		};

		sd.init();
	}

	//全局
	window.ShootDice = ShootDice;

})();