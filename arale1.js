//http://www.tuicool.com/articles/Ivamyir

function F(){}
Object.prototype.a = function() {
	// body...
};

Function.prototype.b= function(){

};

function Ctor(){}

var createProto = Object.__proto__ ? function(proto){
	return{

		__proto__ : proto
	}
}: function(proto){
	Ctor.prototype = proto;
	return new Ctor();
}

function getProto1(proto,c){
	Ctor.prototype = proto;
	var o = new Ctor();
	o.constructor = c;
	return o;
}

function getProto2(proto,c){
	return Object.create(proto,{
		constructor:{
			value:c
		}
	});
}

function getProto3(proto,c){
	return{

		__proto__:proto,
		constructor:c
	}
}

function Class(o){
	if(!(this instance of Class) && isFunction(o)){
		return classify(o);
	}
}

function classify(cls){
	cls.extend =Class.extend;
	cls.implement = implement;
	return cls;
}

function Animal{ }

Animal.prototype.talk = function(){}

var Dog = Class(Animal).extend({

	swim: function(){}
});

Class.Mutators = {

	Extends:function(parent){
		var existed = this.prototype;

		//建立原型链来继承
		var proto = createProto(parent.prototype);
		mix(proto,existed);

		proto.constructor = this;
		this.prototype = proto;

		this.superclass = parent.prototype;
	},

	Implements:function(items){

		//将参数变成数组
		isArray(items) || (items = [items]);
		var proto = this.prototype,item;
		while(item = items.shift()){
			mix(proto,item.prototype || item);
		}
	},

	Statics:function(staticProperties){
		//直接混入静态属性
		mix(this,staticProperties);
	}
}

function implement(properties){
	var key,value;
	for(key in properties){
		value = properties[key];
		if(Class.Mutators.hasOwnProperty(key)){
			Class.Mutators[key].call(this,value);
		}else{
			this.prototype[key] = value;
		}
	}
}

Class.create = function(parent,properties){
	if(!isFunction(parent)){
		properties = parent;
		parent = null;
	}

	properties || (properties = {});

	parent || (parent = properties.Extends || Class);

	properties.Extends = parent;

	function SubClass(){

		parent.apply(this,arguments);

		if(this.constructor === SubClass && this.initialize){
			this.initialize.apply(this,arguments);
		}
	}

	if(parent !== Class){
		Mix(SubClass,parent,parent.staticsWhiteList);
	}

	implement.call(SubClass,properties);

	return classify(SubClass);
}

Class.extend = function(properties){
	properties || (properties = {});

	properties.Extends = this;

	return Class.create(properties);
}