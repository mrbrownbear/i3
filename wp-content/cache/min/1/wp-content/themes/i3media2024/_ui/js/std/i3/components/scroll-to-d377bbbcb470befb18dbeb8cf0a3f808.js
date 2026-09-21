"use strict";i3.use({"object":""});i3.object.extend({__name__:"i3-scroll-to",__constructor__:function(self,params){var component=this;params=i3.extend(!0,{event:i3(self).is('select')?'change':'click',axis:'y',target:"i3(this).attr('href')",delay:0,speed:'slow',before:undefined},params);if(!params.offset)
params.offset={};i3(self).on(component.__event__(params.event),function(ev){ev.preventDefault();var target=component.__target__(i3(self).is("select")?i3(self).find("option:selected"):self,params.target);if(target.node.length==0&&target.node.selector[0]=="#")
target=component.__target__(self,"[name='"+target.node.selector.substring(1)+"']");if(params.before){if(params.before(target)===!1)
return!0}
if(params.delay)
window.setTimeout(function(){component.scroll(target)},params.delay);else component.scroll(target)});this.params(params)},scroll:function(target){var params=this.__params__;var animate={};var zoom=parseFloat(i3("html").css("zoom"))||1;if(params.axis.indexOf('x')!==-1)
animate.scrollLeft=(i3(target.node).offset().left-(params.offset.left||0))*zoom;if(params.axis.indexOf('y')!==-1)
animate.scrollTop=(i3(target.node).offset().top-(params.offset.top||0))*zoom;if((animate.scrollLeft?animate.scrollLeft>0:!0)&&(animate.scrollTop?animate.scrollTop>0:!0))
$("html, body").animate(animate,params.speed)}})