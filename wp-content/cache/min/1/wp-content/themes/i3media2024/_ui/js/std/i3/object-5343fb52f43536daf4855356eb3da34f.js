var __interface__=function(){};__interface__.extend=function(extension){var init=!1;var prototype=new this();var ancestor=prototype.__name__;init=!0;for(var index in extension)
prototype[index]=extension[index];function __interface__(node,params,child){var self=this;this.__params__=[];if(this.__selector__&&!i3(node).is(this.__selector__)){i3.warn("Incorrect selector - expected: "+this.__selector__,node);return!1}
if(init&&node){this.__id__="-"+parseInt(Math.random()*Math.pow(10,8));this.__node__=node;this.__params__=params;this.__params__.__component__=this;this.__ancestor__=ancestor;if(!this.__events__)
this.__events__=[];i3.each(this.__events__,function(index,value){if(params[value]&&i3.is(params[value],'string')&&i3.string.is(params[value],'function'))
params[value]=i3.string.to(params[value],'function')});if(this.__constructor__)
this.__constructor__(node,i3.subset(params,function(index){return index.indexOf("__")!==0}));if(!child){i3.each(this.__events__.concat(["__init__","destroy"]),function(index,value){i3(node).on((self.__params__[value]&&i3.type(self.__params__[value])=='string'?self.__params__[value]:value)+"."+self.__name__+self.__id__,function(ev){if(self[value]&&i3.is(self[value],'function'))
self[value].apply(self,[node,ev].concat([].slice.call(arguments).slice(1)));if(self.__params__[value]&&i3.is(self.__params__[value],'function'))
self.__params__[value].apply(self,arguments.length>0?[].slice.call(arguments):[ev])})})}}else if(init&&!node&&params){params=i3.extend(!0,{},i3.defaults.components[this.__name__]||{},params);if(this.__constructor__)
this.__constructor__(node,i3.subset(params,function(index){return index.indexOf("__")!==0}))}
return this}
if(extension.__name__&&!i3.fn[extension.__name__]){i3.fn[extension.__name__]=function(params){if(i3(this).data(extension.__name__)?!i3(this).data(extension.__name__).__id__:!0)
i3(this).data(extension.__name__,new i3.object[extension.__name__](this,params));else{}
return i3(this)}}
__interface__.prototype=prototype;__interface__.prototype.constructor=__interface__;__interface__.extend=arguments.callee;return(extension.__name__?(i3.object[extension.__name__]=__interface__):__interface__)};i3.object=__interface__.extend({__constructor__:function(){},__destructor__:function(self){var component=this;i3.each(this.__events__,function(index,value){i3(self).off(value+"."+component.__name__+component.__id__)})},destroy:function(){return this.__destructor__(this.__node__,this.__params__)},__init__:function(){},__target__:function(self,target,params){if(!i3.is(params,'object')||i3.is(params,'jquery'))
params={"default":params}
var ret=i3.extend(target,{selector:i3.def(i3.is(target,'object')?target.selector:null,target,params['default'])});if(!ret.node)
ret.node=i3.to(ret.selector,'node',self);if(params.contained)
ret.node=i3(ret.node).filter(function(){return i3.contains(self.get(0),this)||(params['default']&&i3(this).is(params['default']))});return ret},__template__:function(self,template,value){var values=[];if(i3.is(value,'array'))
values=values.concat(value);else values.push(value);values.push(self);return i3.is(template,"function")?template.apply(this,values):i3.is(template,["jquery","node"])?template.clone(!0,!0):i3(template)},__event__:function(event){var component=this;return event.split(" ").map(function(value){return value+"."+component.__name__+component.__id__}).join(" ")},run:function(name){if(i3.is(this[name],'function')){var params=[].splice.call(arguments,1);return this[name].apply(this,[this.__node__].concat(params))}},node:function(){return this.__node__},params:function(input){if(typeof input!=="undefined")
i3.extend(this.__params__,input);return this.__params__},name:function(){return this.__name__},events:function(){return this.__events__},paramsToDOM:function(){var args=[].splice.call(arguments,0);var copy={};i3.each(this.params(),function(index,value){if(args.length==0||i3.inArray(index,args)!==-1)
copy[index]=value});return copy}})