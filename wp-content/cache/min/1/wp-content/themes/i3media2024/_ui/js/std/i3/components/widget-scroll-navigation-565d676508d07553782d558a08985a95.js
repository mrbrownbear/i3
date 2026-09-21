"use strict";i3.use({"object":""});i3.object.extend({__name__:"i3-widget-scroll-navigation",__constructor__:function(self,params){var component=this;params=i3.extend(!0,{offsets:{},"class":{up:"",down:""},__scrollTop__:i3(window).scrollTop()},params);for(var i in params.offsets){var matches=undefined;if(typeof params.offsets[i]=="string"){if((matches=params.offsets[i].match(/^top(?:\s*([+-])\s*(\d+))?$/))){params.offsets[i]=this.node().position().top;if(matches[1]!==undefined&&matches[2]!==undefined){if(matches[1]=="+")
params.offsets[i]+=parseInt(matches[2]);else if(matches[1]=="-")
params.offsets[i]-=parseInt(matches[2])}}else if((matches=params.offsets[i].match(/^bottom(?:\s*([+-])\s*(\d+))?$/))){params.offsets[i]=this.node().position().top+this.node().outerHeight();if(matches[1]!==undefined&&matches[2]!==undefined){if(matches[1]=="+")
params.offsets[i]+=parseInt(matches[2]);else if(matches[1]=="-")
params.offsets[i]-=parseInt(matches[2])}}}}
this.params(params)},__init__:function(){var component=this;i3(window).on('scroll',function(){component.__event__()}).trigger('scroll')},__event__:function(event){var params=this.params();var node=this.node();if(params['class'].up!=params['class'].down){if(params.__scrollTop__>i3(window).scrollTop())
i3(node).addClass(params['class'].up).removeClass(params['class'].down);else i3(node).addClass(params['class'].down).removeClass(params['class'].up)}
params.__scrollTop__=i3(window).scrollTop();for(var i in params.offsets){if(i3(window).scrollTop()>parseInt(params.offsets[i]))
i3(node).addClass(i);else i3(node).removeClass(i)}}})