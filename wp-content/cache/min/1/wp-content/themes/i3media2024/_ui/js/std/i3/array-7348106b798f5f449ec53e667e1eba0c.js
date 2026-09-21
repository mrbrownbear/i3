"use strict";i3.array={};i3.array.equal=function(x,y){if(!i3.is(x,['array','object'])||!i3.is(y,['array','object']))
return!1;var seen=[];return(function equals(x,y){if(x===y)
return!0;if(!(x instanceof Object)||!(y instanceof Object))
return!1;if(x.constructor!==y.constructor)
return!1;for(var p in x){if(x.hasOwnProperty(p)){if(!y.hasOwnProperty(p))
return!1;if(x[p]===y[p])
continue;if(typeof(x[p])!=="object")
return!1;if(seen.indexOf(x[p])!==-1){i3.warn(string,"Cannot compare some cyclical objects");return!1}
seen.push(x[p]);if(!equals(x[p],y[p]))
return!1}}
for(p in y)
if(y.hasOwnProperty(p)&&!x.hasOwnProperty(p))
return!1;return!0})(x,y);}
i3.array.keys=function(arr,value){if(!i3.is(arr,['array','object']))
return!1;var ret=[];if(!i3.is(value,'empty')){for(var i in arr)
if(i3.is(value,['array','object'])?i3.inArray(arr[i],value):arr[i]==value)
ret.push(i);if(ret.length==1)
return ret[0]}else{for(var i in arr)
ret.push(i);return ret}
return!1}
i3.array.values=function(arr,value){if(!i3.is(arr,['array','object']))
return!1;var ret=[];if(!i3.is(value,'empty')){for(var i in arr)
if(i3.is(value,['array','object'])?i3.inArray(i,value):i==value)
ret.push(value);if(ret.length==1)
return ret[0]}else{for(var i in arr)
ret.push(arr[i]);return ret}
return!1}
i3.array.merge=function(arr1,arr2){if(!i3.is(arr1,['array','object'])||!i3.is(arr2,['array','object']))
return!1;for(var i in arr2){if(arr1[i]&&i3.is(arr1[i],['array','object'])&&i3.is(arr2[i],['array','object']))
arr1[i]=i3.array.merge(arr1[i],arr2[i]);else arr1[i]=arr2[i]}
return arr1}
i3.array.unique=function(arr){if(!i3.is(arr,['array','object']))
return!1;var key='',tmp_arr2=[],val='';var __array_search=function(needle,haystack){var fkey='';for(fkey in haystack)
if(haystack.hasOwnProperty(fkey))
if((haystack[fkey]+'')===(needle+''))
return fkey;return!1};for(key in arr)
if(arr.hasOwnProperty(key)){val=arr[key];if(!1===__array_search(val,tmp_arr2))
tmp_arr2.push(val)}
return tmp_arr2}
i3.array.diff=function(obj){if(!i3.is(obj,['array','object']))
return!1;var retArr=[],argl=arguments.length,k1='',i=1,k='',arr={};keys:for(k1 in obj){for(i=1;i<argl;i++){arr=arguments[i];for(k in arr){if(arr[k]===obj[k1]){continue keys}}
retArr.push(obj[k1])}}
return retArr}
i3.array.reverse=function(arr){if(!i3.is(arr,['array','object']))
return!1;var output=[],keys=[];for(var k in arr)
keys.unshift(k);for(var c=keys.length,n=0;n<c;n++)
output[keys[n]]=arr[keys[n]];return output}
i3.array.httpBuildQuery=function(arr,sub){if(!i3.is(arr,['array','object']))
return!1;if(!sub)
sub="";var string="";for(var index in arr)
if(String(index).length>0){if(typeof arr[index]=="object"&&arr[index]!=null&&arr[index]!=undefined&&(arr[index].length==undefined||arr[index].length>0))
string+=i3.array.httpBuildQuery(arr[index],sub?sub+"["+index+"]":index);else string+="&"+(sub?sub+"["+index+"]":index+(typeof arr[index]=="object"?"[]":""))+"="+(arr[index]!=null&&arr[index]!=undefined?encodeURIComponent(arr[index]):'')}
return string}
i3.array.stringify=function(obj){if(!i3.is(obj,['array','object']))
return!1;if(window.JSON)
return JSON.stringify(obj);var t=typeof(obj);if(t!="object"||obj===null){if(t=="string")obj='"'+obj+'"';return String(obj)}else{var n,v,json=[],arr=(obj&&obj.constructor==Array);for(n in obj){v=obj[n];t=typeof(v);if(t=="string")v='"'+v.replace(/\"/g,"\\\"").replace(/[\x00-\x1F\x7F]/g,"")+'"';else if(t=="object"&&v!==null)v=i3.array.to(v,'json');json.push((arr?"":'"'+n+'":')+String(v))}
return(arr?"[":"{")+String(json)+(arr?"]":"}")}}
i3.array.to=function(arr,type){if(!i3.is(arr,['array','object']))
return!1;switch(type){case 'json':return i3.array.stringify(arr);break;case 'url':return i3.string.trim(i3.array.httpBuildQuery(arr),"&");break}
return!1}
i3.array.find=function(arr,paramsSearch,paramsUpdate){if(!i3.is(arr,['array','object']))
return!1;var ret=null;for(var i in arr)
if(i3.isPlainObject(arr[i])||i3.isArray(arr[i])){var subret=i3.array.find(arr[i],paramsSearch,paramsUpdate);if(subret!==null)
return subret}else if(i==paramsSearch.attr&&arr[i]===paramsSearch.value){if(paramsUpdate===undefined)
return arr;else{arr[paramsUpdate.attr]=paramsUpdate.value;return arr}}
return ret}