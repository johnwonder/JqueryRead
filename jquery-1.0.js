/*
 * jQuery - New Wave Javascript
 *
 * Copyright (c) 2006 John Resig (jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt) 
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2006-10-27 23:14:48 -0400 (Fri, 27 Oct 2006) $
 * $Rev: 509 $
 */

// Global undefined variable
//window本来是没有undefined属性的，所以window.undefined的值就是undefined，把undefined赋值给window.undefined属性，undefined就变成全局变量了
//http://www.2cto.com/kf/201111/110402.html
window.undefined = window.undefined;
function jQuery(a,c) {

    // Shortcut for document ready (because $(document).each() is silly)
    //处理 ready函数,$(function(){})
	if ( a && a.constructor == Function && jQuery.fn.ready )
		return jQuery(document).ready(a);

	// Make sure that a selection was provided
	a = a || jQuery.context || document;

	// Watch for when a jQuery object is passed as the selector
	//如果a 是jQuery对象，把a和空数组合并，然后返回，这样做的目的是不破坏原来的jQuery对象。
    //（注：jquery属性是每个jQuery对象都有的，值为jQuery的版本。
	if (a.jquery)
		return $( jQuery.merge( a, [] ) );

	// Watch for when a jQuery object is passed at the context
    //如果c是jQuery对象，调用find函数，去查找
	if ( c && c.jquery )
		return $( c ).find(a);
	
	// If the context is global, return a new object
	//jquery("#example") 第一次 进入  返回 new Jquery(),
	//进入jQuery.find
	if ( window == this )
		return new jQuery(a,c);

	// Handle HTML strings
	//处理html字符串
	//以非<开头 当中<> 非>结束
	//如果a是html代码，$("<div/>")，把html代码转成Dom元素
    //jQuery.clean 就是把html代码 转换成Dom元素数组
	var m = /^[^<]*(<.+>)[^>]*$/.exec(a);
	if ( m ) a = jQuery.clean( [ m[1] ] );

	// Watch for when an array is passed in
	//如果a是数组或类数组，并且里面装的都是dom元素，把a和空数组合并一下
	//如果是其他情况，就调用find函数,find函数是处理css表达式的
    //最后调用get方法，做出jQuery对象返回
	this.get( a.constructor == Array || a.length && !a.nodeType && a[0] != undefined && a[0].nodeType
     ?
	// Assume that it is an array of DOM Elements
        //假设是个Dom元素数组 ，那么合并
		jQuery.merge( a, [] ) :

		// Find the matching elements and save them for later
		//调用jQuery 静态方法 通过Jquery.extend扩展
		jQuery.find( a, c ) );

  // See if an extra function was provided
  //参数里是否有扩展方法提供
	var fn = arguments[ arguments.length - 1 ];
	
	// If so, execute it in context
	if ( fn && fn.constructor == Function )
		this.each(fn);//通过jQuery.prototype  原型链
}

// Map over the $ in case of overwrite
//如果$被重写,那么映射到_$上
if ( $ )
	jQuery._$ = $;

// Map the jQuery namespace to the '$' one
//$(Function) ready函数

//$(Element) /$([Element]) 可以把Dom元素或者数组直接转换成jQuery对象
//$(Css Expression,Content),也可以把css表达式来选取Dom元素
//$(Html) html也可以转换成jQuery对象

var $ = jQuery;
//jquery对象方法
jQuery.fn = jQuery.prototype = {
	jquery: "$Rev: 509 $",
    // 返回jQuery对象的大小,jQuery对象是一个类数组对象,有length,可以索引下标，但是没有数组方法.
	size: function() {
		return this.length;
	},
    //get方法很灵活，参数可有可无。不带参数返回一个jQuery对象数组；参数num为数字型,返回第num个元素；
	get: function( num ) {
		// Watch for when an array (of elements) is passed in
		if ( num && num.constructor == Array ) {

			// Use a tricky hack to make the jQuery object
		    // look and feel like an array
		    //var obj = new Object();
		    //obj.length =0;
		    //[].push.apply(obj,[1,2,3])
		    //console.log(obj.length)
            //3
			this.length = 0;
			[].push.apply( this, num );
			
			return this;
		} else
			return num == undefined ?

				// Return a 'clean' array
				jQuery.map( this, function(a){ return a } ) :

				// Return just the object
				this[num];
	},
each: function (fn, args) {
        //调用jQuery静态方法each
		return jQuery.each( this, fn, args );
	},

	index: function( obj ) {
		var pos = -1;
		this.each(function(i){
			if ( this == obj ) pos = i;
		});
		return pos;
	},

	attr: function( key, value, type ) {
		// Check to see if we're setting style values
		return key.constructor != String || value != undefined ?
			this.each(function(){
				// See if we're setting a hash of styles
				if ( value == undefined )
					// Set all the styles
					for ( var prop in key )
						jQuery.attr(
							type ? this.style : this,
							prop, key[prop]
						);
				
				// See if we're setting a single key/value style
				else
					jQuery.attr(
						type ? this.style : this,//这边的this已经是dom对象
						key, value
					);
			}) :
			
			// Look for the case where we're accessing a style value
			//读取属性值 css ->调用静态方法jQuery.curCSS
			jQuery[ type || "attr" ]( this[0], key );
	},

	css: function( key, value ) {
		return this.attr( key, value, "curCSS" );
},
   //如果节点是元素节点，则 nodeType 属性将返回 1。 
   //如果节点是属性节点，则 nodeType 属性将返回 2。
   //最终通过各个节点的nodeValue 拼接返回
	text: function(e) {
		e = e || this;
		var t = "";
		for ( var j = 0; j < e.length; j++ ) {
			var r = e[j].childNodes;
			for ( var i = 0; i < r.length; i++ )
				t += r[i].nodeType != 1 ?
					r[i].nodeValue : jQuery.fn.text([ r[i] ]);//继续调用text方法
		}
		return t;
	},
	wrap: function() {
		// The elements to wrap the target around
		var a = jQuery.clean(arguments);
		
		// Wrap each of the matched elements individually
		return this.each(function(){
			// Clone the structure that we're using to wrap
			var b = a[0].cloneNode(true);

			// Insert it before the element to be wrapped
            //在前面插入
			this.parentNode.insertBefore( b, this );
			
			// Find he deepest point in the wrap structure
			while ( b.firstChild )
				b = b.firstChild;
			
			// Move the matched element to within the wrap structure
			b.appendChild( this );
		});
	},
append: function () {
    //第一个参数是arguments,可能包含dom元素的数组，或者是html字符串。
    //第二个参数true 处理tbody情况.因为当前jQuery实例对象是一个table元素,append一个tr元素，
    //就会有tbody的情况,所以需要处理。像后面的before和after函数就不需要，因为他们是在外部追加元素。
    //第三个参数1,代表方向,1代表正向,从上到下,-1代表反向,从下到上
    //第四个参数function,里面调用的appendChild方法来append元素，底层还是要调用w3c dom函数的。
		return this.domManip(arguments, true, 1, function(a){
		    this.appendChild(a);
		    //dom dom元素
		    //Mainp 就是Mainipulate 
            //Dom操作
		});
	},
	prepend: function() {
		return this.domManip(arguments, true, -1, function(a){
			this.insertBefore( a, this.firstChild );
		});
	},
	before: function() {
		return this.domManip(arguments, false, 1, function(a){
			this.parentNode.insertBefore( a, this );
		});
	},
	after: function() {
		return this.domManip(arguments, false, -1, function(a){
			this.parentNode.insertBefore( a, this.nextSibling );
		});
	},
	end: function() {
		return this.get( this.stack.pop() );//stack 保存了元素数组,get把当前元素数组 push 1.0还没有prevObject
	},
	find: function(t) {
		return this.pushStack( jQuery.map( this, function(a){
			return jQuery.find(t,a);
		}), arguments );
	},

	clone: function(deep) {
		//把当前克隆的元素压入stack
		return this.pushStack( jQuery.map( this, function(a){
			return a.cloneNode( deep != undefined ? deep : true );
		}), arguments );
	},
	//筛选出元素
	//1.2.6 如果是Function的话直接grep
	//如果不是Function那么调用multiFilter
	filter: function(t) {
		return this.pushStack(
			t.constructor == Array &&
			jQuery.map(this,function(a){
				for ( var i = 0; i < t.length; i++ )
					if ( jQuery.filter(t[i],[a]).r.length )
						return a;
			}) ||

			t.constructor == Boolean &&
			( t ? this.get() : [] ) ||
			
			t.constructor == Function &&
			jQuery.grep( this, t ) ||

			jQuery.filter(t,this).r, arguments );
	},

	//如果给定一个表示 DOM 元素集合的 jQuery 对象，.not() 方法会用匹配元素的子集构造一个新的 jQuery 对象。所应用的选择器会检测每个元素；不匹配该选择器的元素会被包含在结果中
	not: function(t) {
		return this.pushStack( t.constructor == String ?
			jQuery.filter(t,this,false).r :
			jQuery.grep(this,function(a){ return a != t; }), arguments );
	},
	//add() 方法将元素添加到匹配元素的集合中。
	add: function(t) {
		return this.pushStack( jQuery.merge( this, t.constructor == String ?
			jQuery.find(t) : t.constructor == Array ? t : [t] ), arguments );
	},
	is: function(expr) {
		return expr ? jQuery.filter(expr,this).r.length > 0 : this.length > 0;
	},
	domManip: function(args, table, dir, fn){
		var clone = this.size() > 1;
		var a = jQuery.clean(args);
		
		return this.each(function(){
			var obj = this;
			
			if ( table && this.nodeName == "TABLE" && a[0].nodeName != "THEAD" ) {
				var tbody = this.getElementsByTagName("tbody");

				if ( !tbody.length ) {
					obj = document.createElement("tbody");
					this.appendChild( obj );
				} else
					obj = tbody[0];
			}

			for ( var i = ( dir < 0 ? a.length - 1 : 0 );
				i != ( dir < 0 ? dir : a.length ); i += dir ) {
			    fn.apply(obj, [clone ? a[i].cloneNode(true) : a[i]]);
			    //把一个列表项从一个列表复制到另一个：cloneNode
			    //jQuery实例对象多个元素的时候，你把args append到第一个元素上了，jQuery实例的第二个元素他怎么办啊？他没有可以append的了？！所以，上来要判断一下size是不是大于
			}
		});
	},
	pushStack: function(a,args) {
		var fn = args && args[args.length-1];

		if ( !fn || fn.constructor != Function ) {
			if ( !this.stack ) this.stack = [];
			this.stack.push( this.get() );//get()把当前对象压入堆栈
			//jQuery.map( this, function(a){ return a } ) :
			this.get( a );
		} else {
			var old = this.get();//里面调用map function ,返回当前jquery对象
			this.get( a );//貌似是为了执行fn
			if ( fn.constructor == Function )
				return this.each( fn );
			this.get( old );
		}

		return this;
	}
};
//这里 生成 jQuery[] 的使用
jQuery.extend = jQuery.fn.extend = function(obj,prop) {
	if ( !prop ) { prop = obj; obj = this; }
	for ( var i in prop ) obj[i] = prop[i];
	return obj;
};

//静态方法生成
jQuery.extend({
	init: function(){
		jQuery.initDone = true;
		
		jQuery.each( jQuery.macros.axis, function(i,n){
			jQuery.fn[ i ] = function(a) {
				var ret = jQuery.map(this,n);
				if ( a && a.constructor == String )
					ret = jQuery.filter(a,ret).r;
				return this.pushStack( ret, arguments );
			};
		});
		
        //appendTo 转化为append
		jQuery.each( jQuery.macros.to, function(i,n){
			jQuery.fn[ i ] = function(){
				var a = arguments;
				return this.each(function(){
					for ( var j = 0; j < a.length; j++ )
						$(a[j])[n]( this );
				});
			};
		});
		//哦  在这边把jQuery.macros.each 比如click 加入了fn 
		jQuery.each( jQuery.macros.each, function(i,n){
			jQuery.fn[ i ] = function() {
				return this.each( n, arguments );
			};
		});

		jQuery.each( jQuery.macros.filter, function(i,n){
			jQuery.fn[ n ] = function(num,fn) {
				return this.filter( ":" + n + "(" + num + ")", fn );
			};
		});
		
		jQuery.each( jQuery.macros.attr, function(i,n){
			n = n || i;
			jQuery.fn[ i ] = function(h) {
				return h == undefined ?
					this.length ? this[0][n] : null :
					this.attr( n, h );
			};
		});
	
		jQuery.each( jQuery.macros.css, function(i,n){
			jQuery.fn[ n ] = function(h) {
				return h == undefined ?
					( this.length ? jQuery.css( this[0], n ) : null ) :
					this.css( n, h );
			};
		});

},
//对obj中的每一个对象调用fn函数
//jQuery 对象调用原型方法，原型方法调用静态方法，调用时把this作为参数传进去，静态方法返回时要把this返回。

	each: function( obj, fn, args ) {
		if ( obj.length == undefined )//如果不是数组
			for ( var i in obj )
				fn.apply( obj[i], args || [i, obj[i]] );
		else
			for ( var i = 0; i < obj.length; i++ )
				fn.apply( obj[i], args || [i, obj[i]] );
		return obj;
	},
	
	className: {
		add: function(o,c){
			if (jQuery.className.has(o,c)) return;
			o.className += ( o.className ? " " : "" ) + c;
		},
		remove: function(o,c){
			o.className = !c ? "" :
				o.className.replace(
					new RegExp("(^|\\s*\\b[^-])"+c+"($|\\b(?=[^-]))", "g"), "");
		},
		has: function(e,a) {
			if ( e.className != undefined )
				e = e.className;//直接把e.className给e
			return new RegExp("(^|\\s)" + a + "(\\s|$)").test(e);
		}
	},
	swap: function(e,o,f) {
		for ( var i in o ) {
			e.style["old"+i] = e.style[i];
			e.style[i] = o[i];
		}
		f.apply( e, [] );
		for ( var i in o )
			e.style[i] = e.style["old"+i];
	},
	
	css: function(e,p) {
		if ( p == "height" || p == "width" ) {
			var old = {}, oHeight, oWidth, d = ["Top","Bottom","Right","Left"];
	
			for ( var i in d ) {
				old["padding" + d[i]] = 0;
				old["border" + d[i] + "Width"] = 0;
			}
			//先把e在old中的属性置换为old的属性
			//然后执行function
			//最后在置换回来。
			jQuery.swap( e, old, function() {
				if (jQuery.css(e,"display") != "none") {//这边直接调用jQuery.curCSS方法
					oHeight = e.offsetHeight;
					oWidth = e.offsetWidth;
				} else {
					e = $(e.cloneNode(true)).css({
						visibility: "hidden", position: "absolute", display: "block"
					}).prependTo("body")[0];

					oHeight = e.clientHeight;
					oWidth = e.clientWidth;
					
					e.parentNode.removeChild(e);//从bod'y移除
				}
			});
	
			return p == "height" ? oHeight : oWidth;
		} else if ( p == "opacity" && jQuery.browser.msie )
			return parseFloat( jQuery.curCSS(e,"filter").replace(/[^0-9.]/,"") ) || 1;

		return jQuery.curCSS( e, p );
	},

	curCSS: function(elem, prop, force) {
		var ret;
	
		if (!force && elem.style[prop]) {

			ret = elem.style[prop];

		} else if (elem.currentStyle) {
			//比如-width 替换为Width
			var newProp = prop.replace(/\-(\w)/g,function(m,c){return c.toUpperCase()}); 
			ret = elem.currentStyle[prop] || elem.currentStyle[newProp];

		} else if (document.defaultView && document.defaultView.getComputedStyle) {

			prop = prop.replace(/([A-Z])/g,"-$1").toLowerCase();
			//http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle/
			//Gecko 2.0 (Firefox 4 / Thunderbird 3.3 / SeaMonkey 2.1) 之前，第二个参数“伪类”是必需的（如果不是伪类，设置为null），不过现在嘛，不是必需参数了
			var cur = document.defaultView.getComputedStyle(elem, null);

			if ( cur )
				ret = cur.getPropertyValue(prop);//getPropertyValue方法可以获取CSS样式申明对象上的属性值
			else if ( prop == 'display' )
				ret = 'none';
			else
				//先把elem的style display  赋给olddisplay 再调用function 最后把olddisplay赋给display
				//line 404
				jQuery.swap(elem, { display: 'block' }, function() {
					ret = document.defaultView.getComputedStyle(this,null).getPropertyValue(prop);
				});

		}
		
		return ret;
	},
	
	clean: function(a) {
		var r = [];
		for ( var i = 0; i < a.length; i++ ) {
			if ( a[i].constructor == String ) {

				var table = "";
	            //indexOf 返回0 !0才是正确的
				if ( !a[i].indexOf("<thead") || !a[i].indexOf("<tbody") ) {
					table = "thead";
					a[i] = "<table>" + a[i] + "</table>";
				} else if ( !a[i].indexOf("<tr") ) {
					table = "tr";
					a[i] = "<table>" + a[i] + "</table>";
				} else if ( !a[i].indexOf("<td") || !a[i].indexOf("<th") ) {
					table = "td";
					a[i] = "<table><tbody><tr>" + a[i] + "</tr></tbody></table>";
				}
	
				var div = document.createElement("div");
				div.innerHTML = a[i];
	
				if ( table ) {
					div = div.firstChild;
					if ( table != "thead" ) div = div.firstChild;
					if ( table == "td" ) div = div.firstChild;
				}
	
				for ( var j = 0; j < div.childNodes.length; j++ )
					r.push( div.childNodes[j] );
				} else if ( a[i].jquery || a[i].length && !a[i].nodeType )
					for ( var k = 0; k < a[i].length; k++ )
						r.push( a[i][k] );
				else if ( a[i] !== null )
					r.push(	a[i].nodeType ? a[i] : document.createTextNode(a[i].toString()) );
		}
		return r;
	},
	
	expr: {
		"": "m[2]== '*'||a.nodeName.toUpperCase()==m[2].toUpperCase()",
		"#": "a.getAttribute('id')&&a.getAttribute('id')==m[2]",
		":": {
			// Position Checks
			lt: "i<m[3]-0",
			gt: "i>m[3]-0",
			nth: "m[3]-0==i",
			eq: "m[3]-0==i",
			first: "i==0",
			last: "i==r.length-1",
			even: "i%2==0",
			odd: "i%2",
			
			// Child Checks
			"first-child": "jQuery.sibling(a,0).cur",
			"last-child": "jQuery.sibling(a,0).last",
			"only-child": "jQuery.sibling(a).length==1",
			
			// Parent Checks
			parent: "a.childNodes.length",
			empty: "!a.childNodes.length",
			
			// Text Check
			contains: "(a.innerText||a.innerHTML).indexOf(m[3])>=0",
			
			// Visibility
			visible: "a.type!='hidden'&&jQuery.css(a,'display')!='none'&&jQuery.css(a,'visibility')!='hidden'",
			hidden: "a.type=='hidden'||jQuery.css(a,'display')=='none'||jQuery.css(a,'visibility')=='hidden'",
			
			// Form elements
			enabled: "!a.disabled",
			disabled: "a.disabled",
			checked: "a.checked",
			selected: "a.selected"
		},
		".": "jQuery.className.has(a,m[2])",
		"@": {
			"=": "z==m[4]",
			"!=": "z!=m[4]",
			"^=": "!z.indexOf(m[4])",
			"$=": "z.substr(z.length - m[4].length,m[4].length)==m[4]",
			"*=": "z.indexOf(m[4])>=0",
			"": "z"
		},
		"[": "jQuery.find(m[2],a).length"
	},
	
	token: [
		"\\.\\.|/\\.\\.", "a.parentNode",
		">|/", "jQuery.sibling(a.firstChild)",
		"\\+", "jQuery.sibling(a).next",
		"~", function(a){
			var r = [];
			var s = jQuery.sibling(a);
			if ( s.n > 0 )
				for ( var i = s.n; i < s.length; i++ )
					r.push( s[i] );
			return r;
		}
	],
	find: function( t, context ) {
		// Make sure that the context is a DOM Element
		if ( context && context.nodeType == undefined )
			context = null;

		// Set the correct context (if none is provided)
        //设置当前上下文为Document
		context = context || jQuery.context || document;
	
		if ( t.constructor != String ) return [t];
	
		if ( !t.indexOf("//") ) {
			context = context.documentElement;
			t = t.substr(2,t.length);
		} else if ( !t.indexOf("/") ) {
			context = context.documentElement;
			t = t.substr(1,t.length);
			// FIX Assume the root element is right :(
			if ( t.indexOf("/") >= 1 )
				t = t.substr(t.indexOf("/"),t.length);
		}
	
		var ret = [context];
		var done = [];
		var last = null;
	
		while ( t.length > 0 && last != t ) {
			var r = [];
			last = t;
	
			t = jQuery.trim(t).replace( /^\/\//i, "" );
			
			var foundToken = false;
			//这里调用token 正则匹配 然后在map里传入function的字符串。。
			for ( var i = 0; i < jQuery.token.length; i += 2 ) {
				var re = new RegExp("^(" + jQuery.token[i] + ")");
				var m = re.exec(t);
				
				if ( m ) {
					r = ret = jQuery.map( ret, jQuery.token[i+1] );
					t = jQuery.trim( t.replace( re, "" ) );
					foundToken = true;
				}
			}
			
			if ( !foundToken ) {
				if ( !t.indexOf(",") || !t.indexOf("|") ) {
					if ( ret[0] == context ) ret.shift();
					done = jQuery.merge( done, ret );
					r = ret = [context];
					t = " " + t.substr(1,t.length);
				} else {
					var re2 = /^([#.]?)([a-z0-9\\*_-]*)/i;//# 或 .开头 
					var m = re2.exec(t);
		
					if ( m[1] == "#" ) {
						// Ummm, should make this work in all XML docs
						var oid = document.getElementById(m[2]);
						r = ret = oid ? [oid] : [];
						t = t.replace( re2, "" );
					} else {
						if ( !m[2] || m[1] == "." ) m[2] = "*";
		
						for ( var i = 0; i < ret.length; i++ )
							r = jQuery.merge( r,
								m[2] == "*" ?
									jQuery.getAll(ret[i]) :
									ret[i].getElementsByTagName(m[2])
							);
					}
				}
			}
	
			if ( t ) {
				var val = jQuery.filter(t,r);
				//fileter用来过滤 如 div#example
				//先把div过滤掉 然后 根据通过正则取出 example
				//再通过getAttribute('id') 比较id名称是否一样
				ret = r = val.r;
				t = jQuery.trim(val.t);
			}
		}
	
		if ( ret && ret[0] == context ) ret.shift();//弹出context返回数组原来的第一个元素的值 //该方法会改变数组的长度
		done = jQuery.merge( done, ret );//合并数组
	
		return done;
	},
	
	getAll: function(o,r) {
		r = r || [];
		var s = o.childNodes;
		for ( var i = 0; i < s.length; i++ )
			if ( s[i].nodeType == 1 ) {
				r.push( s[i] );
				jQuery.getAll( s[i], r );
			}
		return r;
	},
	
	attr: function(elem, name, value){
		var fix = {
			"for": "htmlFor",
			"class": "className",
			"float": "cssFloat",
			innerHTML: "innerHTML",
			className: "className"
		};

		if ( fix[name] ) {
			if ( value != undefined ) elem[fix[name]] = value;
			return elem[fix[name]];
		} else if ( elem.getAttribute ) {
			if ( value != undefined ) elem.setAttribute( name, value );
			return elem.getAttribute( name, 2 );
		} else {
			name = name.replace(/-([a-z])/ig,function(z,b){return b.toUpperCase();});
			if ( value != undefined ) elem[name] = value;
			return elem[name];
		}
	},

	// The regular expressions that power the parsing engine
	parse: [
		// Match: [@value='test'], [@foo]
		[ "\\[ *(@)S *([!*$^=]*) *Q\\]", 1 ],

		// Match: [div], [div p]
		[ "(\\[)Q\\]", 0 ],

		// Match: :contains('foo')  * 匹配前面的子表达式任意次。例如，zo*能匹配“z”，也能匹配“zo”以及“zoo”。
		[ "(:)S\\(Q\\)", 0 ],//(:)([a-z*_-][a-z0-9_-]*)\\(*'?\"?([^'\"]*?)'?\"? *\\)

		// Match: :even, :last-chlid
		[ "([:.#]*)S", 0 ]
	],
	
	filter: function(t,r,not) {
		// Figure out if we're doing regular, or inverse, filtering
		//not 为undefined的时候 not!==false返回true 
		//所以g = jQuery.grep
		//grep静态函数第三个参数为true的话就返回不满足条件的新的元素
		//t为:not(.example)的时候就会递归调用
		//最终调用的是grep函数
		var g = not !== false ? jQuery.grep :
			function(a,f) {return jQuery.grep(a,f,true);};
		
		//not(.example) 符合正则
		while ( t && /^[a-z[({<*:.#]/i.test(t) ) {

			var p = jQuery.parse;//parse数组

			for ( var i = 0; i < p.length; i++ ) {
				var re = new RegExp( "^" + p[i][0]

					// Look for a string-like sequence
					.replace( 'S', "([a-z*_-][a-z0-9_-]*)" )

					// Look for something (optionally) enclosed with quotes
					.replace( 'Q', " *'?\"?([^'\"]*?)'?\"? *" ), "i" );

				var m = re.exec( t );

				//:not(.example)递归调用到这
				//满足.example的就是[ "([:.#]*)S", 0 ]
				if ( m ) {
					// Re-organize the match
					if ( p[i][1] )//Match: [@value='test'], [@foo]  p[i][1] 为1
 						m = ["", m[1], m[3], m[2], m[4]];

					// Remove what we just matched
					t = t.replace( re, "" );//一般t就为空了,所以最后就跳出while循环
					//.example的话 t就为空了
					break;//这里就退出循环了
				}
			}
	
			// :not() is a special case that can be optomized by
			// keeping it out of the expression list
			//:not(.example)
			//m[0] = :not(.example)
			//m[1] = :
			//m[2] = not
			//m[3] = .example
			if ( m[1] == ":" && m[2] == "not" )
				r = jQuery.filter(m[3],r,false).r;//递归下 到里面grep就是为包装grep的函数了
			
			// Otherwise, find the expression to execute
			//m[0] = .example
			//m[1] = .
			//m[2] = example
			else {
				//f为 jQuery.className.has(a,m[2])
				var f = jQuery.expr[m[1]];
				if ( f.constructor != String )
					f = jQuery.expr[m[1]][m[2]];
					
				// Build a custom macro to enclose it
				eval("f = function(a,i){" + 
					( m[1] == "@" ? "z=jQuery.attr(a,m[3]);" : "" ) + 
					"return " + f + "}");
				
				// Execute it against the current filter
				//f 为 function(a,i){
				//	return jQuery.className.has(a,m[2]) //m[2] 此时为'example'
				//}
				//再结合 g = function(a,f) {return jQuery.grep(a,f,true);};
				//相当于jQuery.grep(r,f,true)
				r = g( r, f );
			}
		}
	
		// Return an array of filtered elements (r)
		// and the modified expression string (t)
		return { r: r, t: t };
	},
	//去除空格
	//jquery.1.4.3有判断IE的通过\xA0正则判断
	trim: function(t){
		return t.replace(/^\s+|\s+$/g, "");
	},
	//1.2.6放到jquery.each函数中 再通过jquery.fn 包装
	parents: function( elem ){
		var matched = [];
		var cur = elem.parentNode;
		while ( cur && cur != document ) {
			matched.push( cur );
			cur = cur.parentNode;
		}
		return matched;
	},
	sibling: function(elem, pos, not) {
		var elems = [];

		var siblings = elem.parentNode.childNodes;
		for ( var i = 0; i < siblings.length; i++ ) {
			if ( not === true && siblings[i] == elem ) continue;

			if ( siblings[i].nodeType == 1 )//表明是元素
				elems.push( siblings[i] );
			if ( siblings[i] == elem )
				elems.n = elems.length - 1;
		}

		return jQuery.extend( elems, {
			last: elems.n == elems.length - 1,
			//0%2等于0
			cur: pos == "even" && elems.n % 2 == 0 || pos == "odd" && elems.n % 2 || elems[pos] == elem,
			prev: elems[elems.n - 1],
			next: elems[elems.n + 1]
		});
	},
	//合并两个数组
	merge: function(first, second) {
		var result = [];
		
		// Move b over to the new array (this helps to avoid
		// StaticNodeList instances)
		for ( var k = 0; k < first.length; k++ )
			result[k] = first[k];
	
		// Now check for duplicates between a and b and only
		// add the unique items
		for ( var i = 0; i < second.length; i++ ) {
			var noCollision = true;
			
			// The collision-checking process
			for ( var j = 0; j < first.length; j++ )
				if ( second[i] == first[j] )
					noCollision = false;
				
			// If the item is unique, add it
			if ( noCollision )
				result.push( second[i] );
		}
	
		return result;
	},
	grep: function(elems, fn, inv) {
		// If a string is passed in for the function, make a function
		// for it (a handy shortcut)
		if ( fn.constructor == String )
			fn = new Function("a","i","return " + fn);
			
		var result = [];
		
		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0; i < elems.length; i++ )
			if ( !inv && fn(elems[i],i) || inv && !fn(elems[i],i) )
				result.push( elems[i] );
		
		return result;
	},
	map: function(elems, fn) {
		// If a string is passed in for the function, make a function
		// for it (a handy shortcut)
		if ( fn.constructor == String )
			fn = new Function("a","return " + fn);
		
		var result = [];//初始化一个空数组
		
		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0; i < elems.length; i++ ) {
			var val = fn(elems[i],i);//调用参数fn 函数 返回fn中的新结果

			if ( val !== null && val != undefined ) {
				if ( val.constructor != Array ) val = [val];
				result = jQuery.merge( result, val );//合并
			}
		}

		return result;
	},
	
	/*
	 * A number of helper functions used for managing events.
	 * Many of the ideas behind this code orignated from Dean Edwards' addEvent library.
	 */
	event: {
	
		// Bind an event to an element
		// Original by Dean Edwards
		add: function(element, type, handler) {
			// For whatever reason, IE has trouble passing the window object
			// around, causing it to be cloned in the process
			if ( jQuery.browser.msie && element.setInterval != undefined )
				element = window;
		
			// Make sure that the function being executed has a unique ID
			if ( !handler.guid )
				handler.guid = this.guid++;
				
			// Init the element's event structure
			//初始化元素事件结构
			if (!element.events)
				element.events = {};
			
			// Get the current list of functions bound to this event
			var handlers = element.events[type];
			
			// If it hasn't been initialized yet
			if (!handlers) {
				// Init the event handler queue
				handlers = element.events[type] = {};
				
				// Remember an existing handler, if it's already there
				if (element["on" + type])
					handlers[0] = element["on" + type];
			}

			// Add the function to the element's handler list
			handlers[handler.guid] = handler;
			
			// And bind the global event handler to the element
			element["on" + type] = this.handle;
	
			// Remember the function in a global list (for triggering)
			if (!this.global[type])
				this.global[type] = [];
			this.global[type].push( element );//放到global对象的type数组中
		},
		
		guid: 1,
		global: {},
		
		// Detach an event or set of events from an element
		remove: function(element, type, handler) {
			if (element.events)//如果元素有events
				if (type && element.events[type])
					if ( handler )//删除
						delete element.events[type][handler.guid];
					else
						for ( var i in element.events[type] )
							delete element.events[type][i];
				else
					for ( var j in element.events )
						this.remove( element, j );
		},
		
		trigger: function(type,data,element) {
			// Touch up the incoming data
			data = data || [];
	
			// Handle a global trigger
			//全局的触发 ，不管元素
			if ( !element ) {
				var g = this.global[type];
				if ( g )
					for ( var i = 0; i < g.length; i++ )
						this.trigger( type, data, g[i] );//g[i]代表元素
	
			// Handle triggering a single element
			} else if ( element["on" + type] ) {
				// Pass along a fake event
				//伪造一个事件
				//unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
				data.unshift( this.fix({ type: type, target: element }) );
	
				// Trigger the event
				element["on" + type].apply( element, data );
			}
		},
		//把handle方法赋给元素的执行事件 onclick 
		//然后在handle方法里遍历事件
		handle: function(event) {
			//alert(arguments[1]);
			if ( typeof jQuery == "undefined" ) return;

			event = event || jQuery.event.fix( window.event );
	
			// If no correct event was found, fail
			if ( !event ) return;
		
			var returnValue = true;

			var c = this.events[event.type];//这里获得事件
		
			for ( var j in c ) {
				if ( c[j].apply( this, [event] ) === false ) {
					event.preventDefault();
					event.stopPropagation();
					returnValue = false;
				}
			}
			
			return returnValue;
		},
		
		fix: function(event) {
			if ( event ) {
				event.preventDefault = function() {
					this.returnValue = false;
				};
			
				event.stopPropagation = function() {
					this.cancelBubble = true;
				};
			}
			
			return event;
		}
	
	}
});

new function() {
	var b = navigator.userAgent.toLowerCase();

	// Figure out what browser is being used
	jQuery.browser = {
		safari: /webkit/.test(b),
		opera: /opera/.test(b),
		msie: /msie/.test(b) && !/opera/.test(b),
		mozilla: /mozilla/.test(b) && !/compatible/.test(b)
	};

	// Check to see if the W3C box model is being used
	jQuery.boxModel = !jQuery.browser.msie || document.compatMode == "CSS1Compat";
};

jQuery.macros = {
	to: {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after"
	},

	
	css: "width,height,top,left,position,float,overflow,color,background".split(","),

	filter: [ "eq", "lt", "gt", "contains" ],

	attr: {

		val: "value",

		html: "innerHTML",

		id: null,

		title: null,

		name: null,

		href: null,

		src: null,

		rel: null
	},
	
	axis: {

		parent: "a.parentNode",

		ancestors: jQuery.parents,

		parents: jQuery.parents,

		next: "jQuery.sibling(a).next",

		prev: "jQuery.sibling(a).prev",

		siblings: jQuery.sibling,

		children: "a.childNodes"
	},

	each: {

		removeAttr: function( key ) {
			this.removeAttribute( key );
		},
		show: function(){
			this.style.display = this.oldblock ? this.oldblock : "";
			if ( jQuery.css(this,"display") == "none" )//这里有点奇怪
				this.style.display = "block";
		},
		hide: function(){
			this.oldblock = this.oldblock || jQuery.css(this,"display");
			if ( this.oldblock == "none" )
				this.oldblock = "block";
			this.style.display = "none";
		},
		toggle: function(){
			$(this)[ $(this).is(":hidden") ? "show" : "hide" ].apply( $(this), arguments );
		},
		addClass: function(c){
			jQuery.className.add(this,c);
		},
		removeClass: function(c){
			jQuery.className.remove(this,c);
		},
		toggleClass: function( c ){
			jQuery.className[ jQuery.className.has(this,c) ? "remove" : "add" ](this,c);
		},

		remove: function(a){
			if ( !a || jQuery.filter( [this], a ).r )
				this.parentNode.removeChild( this );
		},
		empty: function(){
			while ( this.firstChild )
				this.removeChild( this.firstChild );
		},
		//bind通过jQuery.event添加
		bind: function( type, fn ) {
			if ( fn.constructor == String )
				fn = new Function("e", ( !fn.indexOf(".") ? "$(this)" : "return " ) + fn);
			jQuery.event.add( this, type, fn );
		},

		unbind: function( type, fn ) {
			jQuery.event.remove( this, type, fn );
		},
		trigger: function( type, data ) {
			jQuery.event.trigger( type, data, this );//这里就带元素了
		}
	}
};

jQuery.init();jQuery.fn.extend({

	// We're overriding the old toggle function, so
	// remember it for later
	_toggle: jQuery.fn.toggle,
	toggle: function(a,b) {
		// If two functions are passed in, we're
		// toggling on a click
		return a && b && a.constructor == Function && b.constructor == Function ? this.click(function(e){
			// Figure out which function to execute
			this.last = this.last == a ? b : a;
			
			// Make sure that clicks stop
			e.preventDefault();
			
			// and execute the function
			return this.last.apply( this, [e] ) || false;
		}) :
		
		// Otherwise, execute the old toggle function
		this._toggle.apply( this, arguments );
	},

	hover: function(f,g) {
		
		// A private function for haandling mouse 'hovering'
		function handleHover(e) {
			// Check if mouse(over|out) are still within the same parent element
			var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
	
			// Traverse up the tree
			while ( p && p != this ) p = p.parentNode;
			
			// If we actually just moused on to a sub-element, ignore it
			if ( p == this ) return false;
			
			// Execute the right function
			return (e.type == "mouseover" ? f : g).apply(this, [e]);
		}
		
		// Bind the function to the two event listeners
		return this.mouseover(handleHover).mouseout(handleHover);
},
//参数f就是我们传进来的匿名函数，当isReady标志变量为true的时候,
    //直接执行f函数,否则，把f函数放到readyList数组中去
	ready: function(f) {
		// If the DOM is already ready
		if ( jQuery.isReady )
			// Execute the function immediately
			f.apply( document );
			
		// Otherwise, remember the function for later
		else {
			// Add the function to the wait list
			jQuery.readyList.push( f );//放入readyList数组队列
		}
	
		return this;
	}
});

jQuery.extend({
	/*
	 * All the code that makes DOM Ready work nicely.
	 */
	isReady: false,
	readyList: [],
	
	// Handle when the DOM is ready
	ready: function() {
		// Make sure that the DOM is not already loaded
		if ( !jQuery.isReady ) {
			// Remember that the DOM is ready
			jQuery.isReady = true;
			
			// If there are functions bound, to execute
			if ( jQuery.readyList ) {
				// Execute all of them
				for ( var i = 0; i < jQuery.readyList.length; i++ )
					jQuery.readyList[i].apply( document );
				
				// Reset the list of functions
				jQuery.readyList = null;
			}
		}
	}
});

new function(){

	var e = ("blur,focus,load,resize,scroll,unload,click,dblclick," +
		"mousedown,mouseup,mousemove,mouseover,mouseout,change,reset,select," + 
		"submit,keydown,keypress,keyup,error").split(",");
	//比如$("#element").click(function(){});其实执行的就是bind
	// Go through all the event names, but make sure that
	// it is enclosed properly
    //适当地封闭
    //包装在一个function中执行
	for ( var i = 0; i < e.length; i++ ) new function(){
			
		var o = e[i];
		
		// Handle event binding
		jQuery.fn[o] = function(f){
			//如果没参数f绑定 那么就执行事件。。
			return f ? this.bind(o, f) : this.trigger(o);
		};
		
		// Handle event unbinding
		jQuery.fn["un"+o] = function(f){ return this.unbind(o, f); };
		
		// Finally, handle events that only fire once
		//绑定只能触发一次事件
		jQuery.fn["one"+o] = function(f){
			// Attach the event listener
			return this.each(function(){

				var count = 0;

				// Add the event
				jQuery.event.add( this, o, function(e){
					// If this function has already been executed, stop
					//只能执行一次
					if ( count++ ) return;
				
					// And execute the bound function
					return f.apply(this, [e]);
				});
			});
		};
			
	};
	
	// If Mozilla is used
	if ( jQuery.browser.mozilla || jQuery.browser.opera ) {
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", jQuery.ready, false );
	
	// If IE is used, use the excellent hack by Matthias Miller
	// http://www.outofhanwell.com/blog/index.php?title=the_window_onload_problem_revisited
	} else if ( jQuery.browser.msie ) {

    // Only works if you document.write() it
    //script标签的defer属性，这个defer属性是IE独有的。当它被设为true的时候，表示这段script要等文档加载好了才执行。
		document.write("<scr" + "ipt id=__ie_init defer=true " + 
			"src=//:><\/script>");
	
		// Use the defer script hack
		var script = document.getElementById("__ie_init");
		script.onreadystatechange = function() {
			if ( this.readyState == "complete" )
				jQuery.ready();
		};
	
		// Clear from memory
		script = null;
	
	// If Safari  is used
	} else if ( jQuery.browser.safari ) {
		// Continually check to see if the document.readyState is valid
		//用个定时器轮询 1.2.6改为setTimeout( arguments.callee, 0 );
		//1.4.3改为document.addEventListener
		jQuery.safariTimer = setInterval(function(){
			// loaded and complete are both valid states
			if ( document.readyState == "loaded" || 
				document.readyState == "complete" ) {
	
				// If either one are found, remove the timer
				clearInterval( jQuery.safariTimer );
				jQuery.safariTimer = null;
	
				// and execute any waiting functions
				jQuery.ready();
			}
		}, 10);
	} 

	// A fallback to window.onload, that will always work
	jQuery.event.add( window, "load", jQuery.ready );
	
};
jQuery.fn.extend({

	// overwrite the old show method
	_show: jQuery.fn.show,

	show: function(speed,callback){
		return speed ? this.animate({
			height: "show", width: "show", opacity: "show"
		}, speed, callback) : this._show();
	},
	
	// Overwrite the old hide method
	_hide: jQuery.fn.hide,

	hide: function(speed,callback){
		return speed ? this.animate({
			height: "hide", width: "hide", opacity: "hide"
		}, speed, callback) : this._hide();
	},

	slideDown: function(speed,callback){
		return this.animate({height: "show"}, speed, callback);
	},

	slideUp: function(speed,callback){
		return this.animate({height: "hide"}, speed, callback);
	},

	slideToggle: function(speed,callback){
		return this.each(function(){
			var state = $(this).is(":hidden") ? "show" : "hide";
			$(this).animate({height: state}, speed, callback);
		});
	},
	//淡入
	fadeIn: function(speed,callback){
		return this.animate({opacity: "show"}, speed, callback);
	},
	//淡出
	fadeOut: function(speed,callback){
		return this.animate({opacity: "hide"}, speed, callback);
	},

	fadeTo: function(speed,to,callback){
		return this.animate({opacity: to}, speed, callback);
	},
	animate: function(prop,speed,callback) {
		return this.queue(function(){
		
			this.curAnim = prop;
			//原来是调用了jQuery.fx
			for ( var p in prop ) {
				var e = new jQuery.fx( this, jQuery.speed(speed,callback), p );
				if ( prop[p].constructor == Number )
					e.custom( e.cur(), prop[p] );
				else
					e[ prop[p] ]( prop );//fadein调用了 opacity show
			}
			
		});
	},
	queue: function(type,fn){
		if ( !fn ) {
			fn = type;
			type = "fx";
		}
	
		return this.each(function(){
			if ( !this.queue )
				this.queue = {};
	
			if ( !this.queue[type] )
				this.queue[type] = [];
	
			this.queue[type].push( fn );
		
			if ( this.queue[type].length == 1 )
				fn.apply(this);
		});
	}

});

jQuery.extend({

	setAuto: function(e,p) {
		if ( e.notAuto ) return;

		if ( p == "height" && e.scrollHeight != parseInt(jQuery.curCSS(e,p)) ) return;
		if ( p == "width" && e.scrollWidth != parseInt(jQuery.curCSS(e,p)) ) return;

		// Remember the original height
		var a = e.style[p];

		// Figure out the size of the height right now
		var o = jQuery.curCSS(e,p,1);

		if ( p == "height" && e.scrollHeight != o ||
			p == "width" && e.scrollWidth != o ) return;

		// Set the height to auto
		e.style[p] = e.currentStyle ? "" : "auto";

		// See what the size of "auto" is
		var n = jQuery.curCSS(e,p,1);

		// Revert back to the original size
		if ( o != n && n != "auto" ) {
			e.style[p] = a;
			e.notAuto = true;
		}
	},
	
	speed: function(s,o) {
		o = o || {};
		
		if ( o.constructor == Function )
			o = { complete: o };
		
		var ss = { slow: 600, fast: 200 };
		o.duration = (s && s.constructor == Number ? s : ss[s]) || 400;
	
		// Queueing
		o.oldComplete = o.complete;
		o.complete = function(){
			jQuery.dequeue(this, "fx");
			if ( o.oldComplete && o.oldComplete.constructor == Function )
				o.oldComplete.apply( this );
		};
	
		return o;
	},
	
	queue: {},
	
	dequeue: function(elem,type){
		type = type || "fx";
	
		if ( elem.queue && elem.queue[type] ) {
			// Remove self
			elem.queue[type].shift();
	
			// Get next function
			var f = elem.queue[type][0];
		
			if ( f ) f.apply( elem );
		}
	},

	/*
	 * I originally wrote fx() as a clone of moo.fx and in the process
	 * of making it small in size the code became illegible to sane
	 * people. You've been warned.
	 */
	
	fx: function( elem, options, prop ){
	
		var z = this;
	
		// The users options
		z.o = {
			duration: options.duration || 400,//默认400
			complete: options.complete,
			step: options.step
		};
	
		// The element
		//保存元素到对象中
		z.el = elem;
	
		// The styles
		var y = z.el.style;
	
		// Simple function for setting a style value
		z.a = function(){
			if ( options.step )
				options.step.apply( elem, [ z.now ] );
			//由step里调用
			if ( prop == "opacity" ) {
				if (z.now == 1) z.now = 0.9999;
				if (window.ActiveXObject)
					y.filter = "alpha(opacity=" + z.now*100 + ")";
				else
					y.opacity = z.now;//

			// My hate for IE will never die
			} else if ( parseInt(z.now) )
				y[prop] = parseInt(z.now) + "px";
				
			y.display = "block";
		};
	
		// Figure out the maximum number to run to
		z.max = function(){
			return parseFloat( jQuery.css(z.el,prop) );
		};
	
		// Get the current size
		z.cur = function(){
			var r = parseFloat( jQuery.curCSS(z.el, prop) );
			return r && r > -10000 ? r : z.max();
		};
	
		// Start an animation from one number to another
		z.custom = function(from,to){
			z.startTime = (new Date()).getTime();
			z.now = from;
			z.a();
			//定时触发timer
			z.timer = setInterval(function(){
				z.step(from, to);
			}, 13);
		};
	
		// Simple 'show' function
		z.show = function( p ){
			if ( !z.el.orig ) z.el.orig = {};

			// Remember where we started, so that we can go back to it later
			z.el.orig[prop] = this.cur();

			z.custom( 0, z.el.orig[prop] );

			// Stupid IE, look what you made me do
			//这句话吊
			if ( prop != "opacity" )
				y[prop] = "1px";
		};
	
		// Simple 'hide' function
		z.hide = function(){
			if ( !z.el.orig ) z.el.orig = {};

			// Remember where we started, so that we can go back to it later
			z.el.orig[prop] = this.cur();

			z.o.hide = true;

			// Begin the animation
			z.custom(z.el.orig[prop], 0);
		};
	
		// IE has trouble with opacity if it does not have layout
		if ( jQuery.browser.msie && !z.el.currentStyle.hasLayout )
			y.zoom = "1";
	
		// Remember  the overflow of the element
		if ( !z.el.oldOverlay )
			z.el.oldOverflow = jQuery.css( z.el, "overflow" );
	
		// Make sure that nothing sneaks out
		y.overflow = "hidden";
	
		// Each step of an animation
		z.step = function(firstNum, lastNum){
			var t = (new Date()).getTime();
	
			if (t > z.o.duration + z.startTime) {
				// Stop the timer
				clearInterval(z.timer);
				z.timer = null;

				z.now = lastNum;
				z.a();

				z.el.curAnim[ prop ] = true;
				
				var done = true;
				for ( var i in z.el.curAnim )
					if ( z.el.curAnim[i] !== true )
						done = false;
						
				if ( done ) {
					// Reset the overflow
					y.overflow = z.el.oldOverflow;
				
					// Hide the element if the "hide" operation was done
					if ( z.o.hide ) 
						y.display = 'none';
					
					// Reset the property, if the item has been hidden
					if ( z.o.hide ) {
						for ( var p in z.el.curAnim ) {
							y[ p ] = z.el.orig[p] + ( p == "opacity" ? "" : "px" );
	
							// set its height and/or width to auto
							if ( p == 'height' || p == 'width' )
								jQuery.setAuto( z.el, p );
						}
					}
				}

				// If a callback was provided, execute it
				if( done && z.o.complete && z.o.complete.constructor == Function )
					// Execute the complete function
					z.o.complete.apply( z.el );
			} else {
				// Figure out where in the animation we are and set the number
				var p = (t - this.startTime) / z.o.duration;
				z.now = ((-Math.cos(p*Math.PI)/2) + 0.5) * (lastNum-firstNum) + firstNum;
	
				// Perform the next step of the animation
				z.a();
			}
		};
	
	}

});
// AJAX Plugin
// Docs Here:
// http://jquery.com/docs/ajax/
jQuery.fn.loadIfModified = function( url, params, callback ) {
	this.load( url, params, callback, 1 );
};

jQuery.fn.load = function( url, params, callback, ifModified ) {
	if ( url.constructor == Function )
		return this.bind("load", url);

	callback = callback || function(){};

	// Default to a GET request
	var type = "GET";

	// If the second parameter was provided
	if ( params ) {
		// If it's a function
		if ( params.constructor == Function ) {
			// We assume that it's the callback
			callback = params;
			params = null;
			
		// Otherwise, build a param string
		} else {
			params = jQuery.param( params );
			type = "POST";
		}
	}
	
	var self = this;
	
	// Request the remote document
	jQuery.ajax( type, url, params,function(res, status){
		
		if ( status == "success" || !ifModified && status == "notmodified" ) {
			// Inject the HTML into all the matched elements
			self.html(res.responseText).each( callback, [res.responseText, status] );
			
			// Execute all the scripts inside of the newly-injected HTML
			//执行所有内嵌在新html中的脚本
			//要么src
			//要么执行里面的脚本 通过eval
			$("script", self).each(function(){
				if ( this.src )
					$.getScript( this.src );
				else
					eval.call( window, this.text || this.textContent || this.innerHTML || "" );
			});
		} else
			callback.apply( self, [res.responseText, status] );

	}, ifModified);
	
	return this;
};

// If IE is used, create a wrapper for the XMLHttpRequest object
if ( jQuery.browser.msie )
	XMLHttpRequest = function(){
		return new ActiveXObject(
			navigator.userAgent.indexOf("MSIE 5") >= 0 ?
			"Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
		);
	};

// Attach a bunch of functions for handling common AJAX events
new function(){
	var e = "ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess".split(',');
	
	for ( var i = 0; i < e.length; i++ ) new function(){
		var o = e[i];
		jQuery.fn[o] = function(f){
			return this.bind(o, f);
		};
	};
};

jQuery.extend({
	get: function( url, data, callback, type, ifModified ) {
		if ( data.constructor == Function ) {
			type = callback;
			callback = data;
			data = null;
		}
		
		if ( data ) url += "?" + jQuery.param(data);
		
		// Build and start the HTTP Request
		jQuery.ajax( "GET", url, null, function(r, status) {
			if ( callback ) callback( jQuery.httpData(r,type), status );
		}, ifModified);
	},

	getIfModified: function( url, data, callback, type ) {
		jQuery.get(url, data, callback, type, 1);
	},

	getScript: function( url, data, callback ) {
		jQuery.get(url, data, callback, "script");
	},
	post: function( url, data, callback, type ) {
		// Build and start the HTTP Request
		jQuery.ajax( "POST", url, jQuery.param(data), function(r, status) {
			if ( callback ) callback( jQuery.httpData(r,type), status );
		});
	},
	
	// timeout (ms)
	timeout: 0,

	ajaxTimeout: function(timeout) {
		jQuery.timeout = timeout;
	},

	// Last-Modified header cache for next request
	lastModified: {},
	ajax: function( type, url, data, ret, ifModified ) {
		// If only a single argument was passed in,
		// assume that it is a object of key/value pairs
		if ( !url ) {
			ret = type.complete;
			var success = type.success;
			var error = type.error;
			data = type.data;
			url = type.url;
			type = type.type;
		}
		
		// Watch for a new set of requests
		if ( ! jQuery.active++ )
			jQuery.event.trigger( "ajaxStart" );

		var requestDone = false;
	
		// Create the request object
		var xml = new XMLHttpRequest();
	
		// Open the socket
		xml.open(type || "GET", url, true);
		
		// Set the correct header, if data is being sent
		if ( data )
			xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		// Set the If-Modified-Since header, if ifModified mode.
		if ( ifModified )
			xml.setRequestHeader("If-Modified-Since",
				jQuery.lastModified[url] || "Thu, 01 Jan 1970 00:00:00 GMT" );
		
		// Set header so calling script knows that it's an XMLHttpRequest
		xml.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	
		// Make sure the browser sends the right content length
		if ( xml.overrideMimeType )
			xml.setRequestHeader("Connection", "close");
		
		// Wait for a response to come back
		var onreadystatechange = function(istimeout){
			// The transfer is complete and the data is available, or the request timed out
			if ( xml && (xml.readyState == 4 || istimeout == "timeout") ) {
				requestDone = true;

				var status = jQuery.httpSuccess( xml ) && istimeout != "timeout" ?
					ifModified && jQuery.httpNotModified( xml, url ) ? "notmodified" : "success" : "error";
				
				// Make sure that the request was successful or notmodified
				if ( status != "error" ) {
					// Cache Last-Modified header, if ifModified mode.
					var modRes = xml.getResponseHeader("Last-Modified");
					if ( ifModified && modRes ) jQuery.lastModified[url] = modRes;
					
					// If a local callback was specified, fire it
					if ( success ) success( xml, status );
					
					// Fire the global callback
					jQuery.event.trigger( "ajaxSuccess" );
				
				// Otherwise, the request was not successful
				} else {
					// If a local callback was specified, fire it
					if ( error ) error( xml, status );
					
					// Fire the global callback
					jQuery.event.trigger( "ajaxError" );
				}
				
				// The request was completed
				jQuery.event.trigger( "ajaxComplete" );
				
				// Handle the global AJAX counter 
				//处理全局计数器
				if ( ! --jQuery.active )
					jQuery.event.trigger( "ajaxStop" );
	
				// Process result
				if ( ret ) ret(xml, status);
				
				// Stop memory leaks
				xml.onreadystatechange = function(){};
				xml = null;
				
			}
		};
		xml.onreadystatechange = onreadystatechange;
		
		// Timeout checker
		if(jQuery.timeout > 0)
			setTimeout(function(){
				// Check to see if the request is still happening
				if (xml) {
					// Cancel the request
					xml.abort();

					if ( !requestDone ) onreadystatechange( "timeout" );

					// Clear from memory
					xml = null;
				}
			}, jQuery.timeout);
		
		// Send the data
		xml.send(data);
	},
	
	// Counter for holding the number of active queries
	active: 0,
	
	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function(r) {
		try {
			return !r.status && location.protocol == "file:" ||
				( r.status >= 200 && r.status < 300 ) || r.status == 304 ||
				jQuery.browser.safari && r.status == undefined;
		} catch(e){}

		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function(xml, url) {
		try {
			var xmlRes = xml.getResponseHeader("Last-Modified");

			// Firefox always returns 200. check Last-Modified date
			return xml.status == 304 || xmlRes == jQuery.lastModified[url] ||
				jQuery.browser.safari && xml.status == undefined;
		} catch(e){}

		return false;
	},
	
	// Get the data out of an XMLHttpRequest.
	// Return parsed XML if content-type header is "xml" and type is "xml" or omitted,
	//返回解析过的xml 如果header是xml 而且类型是xml或者忽略，那就返回解析过的xml
	// otherwise return plain text.
	httpData: function(r,type) {
		var ct = r.getResponseHeader("content-type");
		var data = !type && ct && ct.indexOf("xml") >= 0;
		data = type == "xml" || data ? r.responseXML : r.responseText;

		// If the type is "script", eval it
		if ( type == "script" ) eval.call( window, data );

		return data;
	},
	
	// Serialize an array of form elements or a set of
	// key/values into a query string
	//序列化参数
	param: function(a) {
		var s = [];
		
		// If an array was passed in, assume that it is an array
		// of form elements
		if ( a.constructor == Array ) {
			// Serialize the form elements
			for ( var i = 0; i < a.length; i++ )
				s.push( a[i].name + "=" + encodeURIComponent( a[i].value ) );
			
		// Otherwise, assume that it's an object of key/value pairs
		} else {
			// Serialize the key/values
			for ( var j in a )
				s.push( j + "=" + encodeURIComponent( a[j] ) );
		}
		
		// Return the resulting serialization
		return s.join("&");
	}

});
