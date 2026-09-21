"use strict";i3.use("string","array");i3.node={};i3.node.attached=function(element){if(!i3.is(element,['node','jquery']))
return!1;var ret=!1;i3.each(element,function(){return ret=i3(element).parents('html').length>0});return ret}
i3.node.to=function(node,type,params){if(!i3.is(node,['node','jquery']))
return!1;if(!i3.is(params,'object'))
params={};params=i3.extend(!0,{selector:"*:not([disabled])",key:"name",value:"value",callbacks:{name:function(){return i3(this).attr(params.key)},value:function(){return i3(this).is(":input")?i3(this).val():i3(this).attr(params.value)}}},params);switch(type){case 'array':var o={};i3(node).grab(params.selector+"["+params.key+"]").each(function(){if(i3(this).parents(params.selector+"["+params.key+"]:first").length>0)
return!0;var name=params.callbacks.name.apply(this),value=params.callbacks.value.apply(this);if(i3.is(value,'array'))
for(var i=0;i<value.length;i++)
o=i3.string.parseMap(name,value[i],o);else o=i3.string.parseMap(name,value,o)});return o;break}
return!1}