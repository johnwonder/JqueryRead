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
		getInitial:getInitial
	};

}

var myCounter = createCounter(100);

console.log(myCounter.get());
myCounter.increment(5);
console.log(myCounter.get());
console.log(myCounter.getInitial());