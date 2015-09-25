"use strict";

function createCounter(initial){
	var counter = initial;

	function increment(value){
		counter += value;
	}

	function get(){
		return counter;
	}

	function getInitial(){
		return initial;
	}


	return {
		increment :increment,
		get: get,
		getInitial:getInitial,
		counter,//返回的时候是100
		initial :initial
	};

}

var myCounter = createCounter(100);

myCounter.increment(5);
console.log(myCounter.get());//get的时候已经是105了
console.log(myCounter.counter);//保存的是返回myCounter的时候的值
console.log(myCounter.initial);
console.log(myCounter.getInitial());