/*
*
拼图游戏插件
HTML只需要定义一个带ID的div即可
可自定义参数，如：横竖格子数、背景图、超级模式（可任意两格子交换）等
作者：杨会清
*
*/
var PinTu = function(opt){
	this.oBox = null;		//盒子对象
	this.aLi = null;		//所有格子元素的集合
	this.boxWidth = null;	//盒子的宽度
	this.liWidth = null;	//格子的宽度
	this.coord = [];		//坐标数组
	this.rankArr = [];		//排序数组
	this.range=[];			//可移动范围数据，普通模式下
	this.stepNum = 0;
	
	//实现PC手机都能兼容
	var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
	this.hasTouch = 'ontouchstart' in window && !isTouchPad;
	this.touchStart = this.hasTouch ? 'touchstart' : 'mousedown';
	this.touchMove = this.hasTouch ? 'touchmove' : 'mousemove';
	//this.touchMove = this.hasTouch ? 'touchmove' : '';
	this.touchEnd = this.hasTouch ? 'touchend' : 'mouseup';
	this.endFn = function(){};
	
	//默认参数
	this.setting = {
		boxCell : "pintu",
		num : 3,			//行数或列数
		maxWidth :640,		//盒子的最大宽度
		borSize : 2,		//每个格子之间的距离，类似边框大小
		bgurl : "bj.jpg",	//格子图路径
		isBlankCell : true,		//是否有空白格子
		randomRank : true,		//格子随机排列
		superMode : false,		//超级模式，默认是普通模式
		bgColor : "#2294EA"	//背景色
	}

	extend( this.setting , opt);	//设置的参数覆盖默认参数

	this.init();	//初始化
}

//初始化
PinTu.prototype.init = function(){
	this.oBox = document.getElementById(this.setting.boxCell);	//获取盒子对象
	var boxWidth = this.oBox.offsetWidth;
	
	//计算盒子的实际宽度
	this.boxWidth = boxWidth > this.setting.maxWidth ? this.setting.maxWidth : boxWidth;
	//this.boxWidth = viewWidth() > this.setting.maxWidth ? this.setting.maxWidth : viewWidth();	
	//计算每个格子的实际宽度
	this.liWidth = Math.round((this.boxWidth - this.setting.borSize)/this.setting.num - this.setting.borSize);

	//创建格式元素
	this.setCell(true);
	
	//打乱布局，随机排序
	if(this.setting.randomRank){
		this.randomRank();
	}
	
	//添加拖拽效果
	for(i=0; i<this.aLi.length; i++){
		if(i != this.setting.num-1){
			this.drag(this.aLi[i],this.aLi);
		}
	}
	
	//如果是普通模式，则计算每个格子的可移动范围
	if(!this.setting.superMode){
		this.doRange();
	}
}

//生成格子元素，并设置对应样式
PinTu.prototype.setCell = function (kong,endFun){
	if(typeof(kong) == "undefined"){
		kong = true;
	}
	
	//设置盒子的样式
	this.oBox.style.cssText = "position:relative; width:100%; max-width:"+ this.boxWidth +"px; min-width:300px; margin:0 auto; background:"+this.setting.bgColor+"; overflow:hidden";	
	this.oBox.style.height = this.boxWidth+"px";
	
	//动态生成每个格子，并设置样式
	var srt = "";
	for(i = 0; i<this.setting.num*this.setting.num ;i++){
		srt += '<li value = "' + i + '" style="position:absolute; width:' + this.liWidth + 'px; height:' + this.liWidth + 'px;"></li>';
	}
	this.oBox.innerHTML = '<ul style = "list-style:none;">' + srt +'</ul>';
	
	this.aLi = this.oBox.getElementsByTagName("li");
	
	//再次对每个格子设置样式
	for(i = 0; i<this.setting.num*this.setting.num ;i++){
		if(this.setting.isBlankCell && i == this.setting.num-1 && kong){
			this.aLi[i].style.background = "none";	//设置一个空格子
			//this.aLi[i].style.backgroundColor = this.setting.blankCellColor;
		}else{
			this.aLi[i].style.backgroundImage = "url("+this.setting.bgurl+")";
			this.aLi[i].style.backgroundRepeat = "no-repeat";
			this.aLi[i].style.backgroundSize = this.setting.num*100+"%";
			//this.aLi[i].style.boxSizing = 'border-box';
			//设置每个格子的背景图的定位数据
			this.aLi[i].style.backgroundPosition = "-"+this.liWidth*(i%this.setting.num)+"px -"+this.liWidth*( Math.floor(i/this.setting.num))+"px";
		}
		
		//设置每个格子的位置（正常顺序）
		this.aLi[i].style.top = (this.liWidth+this.setting.borSize)*( Math.floor(i/this.setting.num))+this.setting.borSize+"px";
		this.aLi[i].style.left = (this.liWidth+this.setting.borSize)*(i%this.setting.num)+this.setting.borSize+"px";
	}
	//回调函数
	if(endFun && typeof(eval(endFun))=="function"){
		setTimeout(endFun,300);
	}
}

//随机排序
PinTu.prototype.randomRank = function(){
	//把每个格子的坐标按序号存到数组中
	for(i=0; i<this.aLi.length; i++){
		this.coord[i] = [this.aLi[i].offsetLeft,this.aLi[i].offsetTop ];
		this.rankArr.push(i);
	}
	
	//给数据随机排序
	function randomSort(a, b) {
		return Math.random() > 0.5 ? -1 : 1;
	}
	this.rankArr.sort(randomSort);
		
	//重新排列格子的位置,布局转换
	for(i=0; i<this.rankArr.length; i++){
		this.aLi[i].index = this.rankArr[i];	//设置现在所在位置（即index）
		this.aLi[i].style.left = this.coord[this.rankArr[i]][0]+"px";
		this.aLi[i].style.top = this.coord[this.rankArr[i]][1]+"px";
	}
}

//每个格子的可移动范围
PinTu.prototype.doRange = function(){
	var num = this.setting.num;
	//计算空白格子的位置
	var blackIndex = this.aLi[num-1].index;
	
	for(i=0;i<this.aLi.length;i++){
		this.aLi[i].range = [[0,0],[0,0]];		//先给所有格子的可移动范围（x、y）都设置为0
	}
	
	//初始化空白格子上下左右的格式的index都为null
	var left = null;
	var right = null;
	var top  = null;
	var bottom = null;
	
	//计算x轴方向可移动的位置
	if(blackIndex%num==0){		//空白格子在最左边一排时
		right = blackIndex+1;
	}else if(blackIndex%num==num-1){		//空白格子在最右边一排时
		left = blackIndex-1;
	}else{
		right = blackIndex+1;
		left = blackIndex-1;
	}
	
	//计算y轴方向可移动的位置
	if(blackIndex<num){		//空白格子在最上面一排时
		bottom = blackIndex+num;
	}else if(blackIndex>=num*(num-1)){		//空白格子在最下面一排时
		top = blackIndex-num;
	}else{
		bottom = blackIndex+num;
		top = blackIndex-num;
	}	
	
	for(i=0;i<this.aLi.length;i++){
		if(left!=null && this.aLi[i].index==left){
			this.aLi[i].range[0][1] = 1;
		}
		if(right!=null && this.aLi[i].index==right){
			this.aLi[i].range[0][0] = -1;
		}
		if(top!=null && this.aLi[i].index==top){
			this.aLi[i].range[1][1] = 1;
		}
		if(bottom!=null && this.aLi[i].index==bottom){
			this.aLi[i].range[1][0] = -1;
		}
	}
	
	/*for(i=0;i<this.aLi.length;i++){
		this.aLi[i].innerHTML = "x="+this.aLi[i].range[0][0]+"~"+this.aLi[i].range[0][1]+"<br/>Y="+this.aLi[i].range[1][0]+"~"+this.aLi[i].range[1][1];
	}*/
	
}

//检测是否完成拼图
PinTu.prototype.check = function(){
	var onoff = true;
	for(i=0;i<this.aLi.length;i++){
		if(this.aLi[i].index != this.aLi[i].value){
			onoff =false;	
		}
	}
	return onoff;
}

//超级拖拽
PinTu.prototype.drag = function(obj,aLi){
	var disX = 0;
	var disY = 0;
	var arr = this.coord;
	var izIndex = 2;	
	
	_this = this;
	
	var tStart = function(ev){
		obj.style.zIndex = izIndex++;
		var ev = ev || window.event;
		var point = _this.hasTouch ? ev.touches[0] : ev;
		
		disX = point.pageX - obj.offsetLeft;
		disY = point.pageY - obj.offsetTop;
		
		//添加"触摸移动"事件监听
		document.addEventListener(_this.touchMove, tMove,false);
	
		//添加"触摸结束"事件监听
		document.addEventListener(_this.touchEnd, tEnd,false);

		return false;
		
	};
	
	var tMove = function(ev){
		var ev = ev || window.event;
		var ev = _this.hasTouch ? ev.touches[0] : ev;

		var x = ev.clientX - disX;
		var y = ev.clientY - disY;
		//如果是普通模式，则限制移动位置
		if(!_this.setting.superMode){
			if(x >= _this.coord[obj.index][0]+obj.range[0][0]*_this.liWidth && x <= _this.coord[obj.index][0]+obj.range[0][1]*_this.liWidth){
				obj.style.left = x + 'px';
			}
			
			if(y >= _this.coord[obj.index][1]+obj.range[1][0]*_this.liWidth && y <=  _this.coord[obj.index][1]+obj.range[1][1]*_this.liWidth){
				obj.style.top = y + 'px';
			}
		}else{
			obj.style.left = x + 'px';
			obj.style.top = y + 'px';
		}
		
		//如果是超级模式，则对要交换的元素进行高亮
		if(_this.setting.superMode){
			for(var i=0;i<aLi.length;i++){
				//aLi[i].style.border = '';
				aLi[i].style.boxShadow = '';
			}
			
			var nL = nearLi(obj,aLi);
			
			if(nL){
				nL.style.boxShadow = '0 0 0 2px #f00 inset';
				//nL.style.border = '1px red solid';
			}
		}
		
	}; 
	
	var tEnd = function(){
		document.removeEventListener(_this.touchMove, tMove, false);
		document.removeEventListener(_this.touchEnd, tEnd, false);		
		
		_this.stepNum++;
		
		var nL = nearLi(obj,aLi);
		var tmp = 0;
		
		if(nL){
			startMove( nL , { left : arr[obj.index][0] , top : arr[obj.index][1] });
			
			startMove( obj , { left : arr[nL.index][0] , top : arr[nL.index][1] } ,function(){
				if(_this.check()){
					_this.setCell(false,function(){
						_this.endFn();
					});
				}
			});
			
			if(_this.setting.superMode){
				nL.style.boxShadow = '';
				//nL.style.border = '';
			}
			
			tmp = obj.index;
			obj.index = nL.index;
			nL.index = tmp;
			
			//如果是普通模式，则计算每个格子的可移动范围
			if(!_this.setting.superMode){
				_this.doRange();
			}
		}
		else{
			startMove( obj , { left : arr[obj.index][0] , top : arr[obj.index][1] } );
		}
		
	};
	
	//添加"触摸开始"事件监听
	obj.addEventListener(this.touchStart, tStart ,false);
	
}

//找最近的元素
function nearLi(obj,aLi){
	
	var value = 9999;
	var index = -1;
	
	for(var i=0;i<aLi.length;i++){
		if( pz(obj,aLi[i]) && obj!=aLi[i] ){
			
			var c = jl(obj,aLi[i]);
			
			if( c < value ){
				value = c;
				index = i;
			}
			
		}
	}
	
	if(index != -1){
		return aLi[index];
	}
	else{
		return false;
	}
}

//计算距离
function jl(obj1,obj2){
	
	var a = obj1.offsetLeft - obj2.offsetLeft;
	var b = obj1.offsetTop - obj2.offsetTop;
	
	return Math.sqrt(a*a + b*b);
	
}

//碰撞检测
function pz(obj1,obj2){
	var L1 = obj1.offsetLeft;
	var R1 = obj1.offsetLeft + obj1.offsetWidth;
	var T1 = obj1.offsetTop;
	var B1 = obj1.offsetTop + obj1.offsetHeight;
	
	var L2 = obj2.offsetLeft;
	var R2 = obj2.offsetLeft + obj2.offsetWidth;
	var T2 = obj2.offsetTop;
	var B2 = obj2.offsetTop + obj2.offsetHeight;
	
	if( R1<L2 || L1>R2 || B1<T2 || T1>B2 ){
		return false;
	}
	else{
		return true;
	}
}

//继承
function extend(obj1,obj2){
	for(var attr in obj2){
		obj1[attr] = obj2[attr];
	}
}

//移动函数
function startMove(obj,json,endFn){
	clearInterval(obj.timer);
	obj.timer = setInterval(function(){
		var bBtn = true;
		for(var attr in json){			
			var iCur = 0;		
			if(attr == 'opacity'){
				if(Math.round(parseFloat(getStyle(obj,attr))*100)==0){
					iCur = Math.round(parseFloat(getStyle(obj,attr))*100);			
				}
				else{
					iCur = Math.round(parseFloat(getStyle(obj,attr))*100) || 100;
				}	
			}
			else{
				iCur = parseInt(getStyle(obj,attr)) || 0;
			}
			
			var iSpeed = (json[attr] - iCur)/8;
			iSpeed = iSpeed >0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
			if(iCur!=json[attr]){
				bBtn = false;
			}
			
			if(attr == 'opacity'){
				obj.style.filter = 'alpha(opacity=' +(iCur + iSpeed)+ ')';
				obj.style.opacity = (iCur + iSpeed)/100;		
			}
			else{
				obj.style[attr] = iCur + iSpeed + 'px';
			}	
		}
		
		if(bBtn){
			clearInterval(obj.timer);
			if(endFn){
				endFn.call(obj);
			}
		}
	},30);
}

function getStyle(obj,attr){
	if(obj.currentStyle){
		return obj.currentStyle[attr];
	}
	else{
		return getComputedStyle(obj,false)[attr];
	}
}