"use strict";i3.use('array');i3.string={};i3.string.trim=function(string,value,q){if(i3.is(string,'string')!==!0)
return!1;if(i3.is(value,'empty'))
value="\\s";if(i3.is(value,'array')){for(var i=0;i<value.length;i++)
if(i3.is(value[i],'array')){for(var j=0;j<value[i].length;j++){var nstring=i3.string.trim(string,value[i][j],q);if(nstring.length!=string.length){string=nstring;break}}}else string=i3.string.trim(string,value[i],q)}else string=string.replace(new RegExp("^("+value+")("+value+")"+(q?"{0,"+(q-1)+"}":"*"),'i'),'').replace(new RegExp("("+value+")("+value+")"+(q?"{0,"+(q-1)+"}":"*")+"$",'i'),'');return string}
i3.string.count=function(string){if(i3.is(string,'string')!==!0)
return!1;var count=0;for(var i=1;i<arguments.length;i++){var results=string.match(new RegExp(arguments[i],'g'));count+=results?results.length:0}
return count}
i3.string.repeat=function(string,count){return new Array(count+1).join(string)}
i3.string.between=function(string,char1,char2){if(i3.is(string,'string')!==!0)
return!1;if(i3.is(char2,'empty'))
char2=char1;var temp=0;var pos1=char1&&string.indexOf(char1)!=-1?string.indexOf(char1)+char1.length:0;var pos2=char2&&(temp=string.lastIndexOf(char2))!=-1&&temp+1!=pos1?temp:string.length;return string.substring(pos1,pos2)}
i3.string.escape=function(string,type){if(i3.is(string,'string')!==!0)
return!1;switch(type){case 'selector':return string.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g,'\\$&');break;case 'attribute':return string.replace(/['"]/g,function(i){return'&#'+i.charCodeAt(0)+';'});break;default:return string.replace(/[\\"']/g,'\\$&').replace(/\u0000/g,'\\0')}}
i3.string.unescape=function(string){if(i3.is(string,'string')!==!0)
return!1;return string.replace(/\\(.?)/g,function(s,n1){switch(n1){case '\\':return'\\';case '0':return'\u0000';case '':return'';default:return n1}})}
i3.string.parseQuotes=function(string){if(string[0]=="'"&&string[string.length-1]=="'")
return i3.string.trim(string,"'",1).replace(/\\\'/g,"'").replace(/[\\"]/g,'\\$&');else if(string[0]=='"'&&string[string.length-1]=='"')
return i3.string.trim(string,'"',1);else return string}
i3.string.parseEntity=function(string){var del;if(!i3.is(string,'string')||i3.is(string,'array')||i3.is(string,'empty')||(del=string.indexOf(':'))==-1)
return!1;var label=i3.string.trim(string.substring(0,del),['\\s',"'",'"']).replace(/\\\'/g,"'");var value=i3.string.trim(string.substring(del+1).replace(/[\x00-\x1F\x7F]/g,""));if(i3.string.is(value,'json'))
value=i3.string.trim(value,"\\s");else{var avalue=i3.string.parseQuotes(value);if(value.match(/^{[\s\S]*}$/))
value=i3.string.parse(value);else if(value.match(/^\[[\s\S]+\]$/)){var values=i3.string.parseSplit(i3.string.between(value,'[',']'),'array');var tavalue=null;for(var i in values){values[i]=i3.string.trim(values[i].replace(/[\x00-\x1F\x7F]/g,""));tavalue=i3.string.parseQuotes(values[i]);if(values[i].match(/^{[\s\S]*}$/))
values[i]=i3.string.parse(values[i]);else if(!i3.string.is(tavalue,['number','boolean','null']))
values[i]='"'+tavalue+'"';else values[i]=i3.string.trim(values[i],"\\s").replace(/\'/g,'"')}
value="["+values.join(',')+"]"}else if(!i3.string.is(avalue,['number','boolean','null']))
value='"'+avalue+'"';else value=i3.string.trim(value,"\\s").replace(/\'/g,'"')}
return'"'+label+'":'+value}
i3.string.parseSplit=function(string,type){var array=[];var matches=string.split(',');var part=matches.shift();while(matches.length>0){var check1=null,check2=null;if(i3.is(part,'empty'))
part=matches.shift();else if(i3.string.count(part,"{")==i3.string.count(part,"}")&&i3.string.count(part,"\\[")==i3.string.count(part,"\\]")&&((check1=i3.string.count(part,"([^\\\\]|^|)'"))%2==0)&&((check2=i3.string.count(part,'([^\\\\]|^|)"'))%2==0)&&(type=='array'?!0:part.indexOf(":")!==-1)){if(part.length>0)
array.push(part);part=matches.shift()}else if(type!='array'&&part.indexOf(":")===-1){var last=array.pop();if(last!==undefined)
part=last+","+part;else part+=","+matches.shift()}else part+=","+matches.shift()}
if(part.length>0){if(type!='array'&&part.indexOf(":")===-1&&array.length>0)
array.push(array.pop()+","+part);else array.push(part)}
return array}
i3.string.parse=function(string){if(i3.is(string,'string')!==!0)
return!1;string=i3.string.trim(string,"\\s");if(string.match(/^{[\s\S]+}$/))
string=i3.string.between(string,'{','}');var array=i3.string.parseSplit(string);var ret=[],entity=null;for(var i=0;i<array.length;i++)
if((entity=i3.string.parseEntity(array[i]))!=!1)
ret.push(entity);return"{"+ret.join(',')+"}"}
i3.string.getHtmlTranslationTable=function(table,quote_style){var entities={},hash_map={},decimal;var constMappingTable={},constMappingQuoteStyle={};var useTable={},useQuoteStyle={};constMappingTable[0]='HTML_SPECIALCHARS';constMappingTable[1]='HTML_ENTITIES';constMappingQuoteStyle[0]='ENT_NOQUOTES';constMappingQuoteStyle[2]='ENT_COMPAT';constMappingQuoteStyle[3]='ENT_QUOTES';useTable=!isNaN(table)?constMappingTable[table]:table?table.toUpperCase():'HTML_SPECIALCHARS';useQuoteStyle=!isNaN(quote_style)?constMappingQuoteStyle[quote_style]:quote_style?quote_style.toUpperCase():'ENT_COMPAT';if(useTable!=='HTML_SPECIALCHARS'&&useTable!=='HTML_ENTITIES'){throw new Error("Table: "+useTable+' not supported')}
entities['38']='&amp;';if(useTable==='HTML_ENTITIES'){entities['160']='&nbsp;';entities['161']='&iexcl;';entities['162']='&cent;';entities['163']='&pound;';entities['164']='&curren;';entities['165']='&yen;';entities['166']='&brvbar;';entities['167']='&sect;';entities['168']='&uml;';entities['169']='&copy;';entities['170']='&ordf;';entities['171']='&laquo;';entities['172']='&not;';entities['173']='&shy;';entities['174']='&reg;';entities['175']='&macr;';entities['176']='&deg;';entities['177']='&plusmn;';entities['178']='&sup2;';entities['179']='&sup3;';entities['180']='&acute;';entities['181']='&micro;';entities['182']='&para;';entities['183']='&middot;';entities['184']='&cedil;';entities['185']='&sup1;';entities['186']='&ordm;';entities['187']='&raquo;';entities['188']='&frac14;';entities['189']='&frac12;';entities['190']='&frac34;';entities['191']='&iquest;';entities['192']='&Agrave;';entities['193']='&Aacute;';entities['194']='&Acirc;';entities['195']='&Atilde;';entities['196']='&Auml;';entities['197']='&Aring;';entities['198']='&AElig;';entities['199']='&Ccedil;';entities['200']='&Egrave;';entities['201']='&Eacute;';entities['202']='&Ecirc;';entities['203']='&Euml;';entities['204']='&Igrave;';entities['205']='&Iacute;';entities['206']='&Icirc;';entities['207']='&Iuml;';entities['208']='&ETH;';entities['209']='&Ntilde;';entities['210']='&Ograve;';entities['211']='&Oacute;';entities['212']='&Ocirc;';entities['213']='&Otilde;';entities['214']='&Ouml;';entities['215']='&times;';entities['216']='&Oslash;';entities['217']='&Ugrave;';entities['218']='&Uacute;';entities['219']='&Ucirc;';entities['220']='&Uuml;';entities['221']='&Yacute;';entities['222']='&THORN;';entities['223']='&szlig;';entities['224']='&agrave;';entities['225']='&aacute;';entities['226']='&acirc;';entities['227']='&atilde;';entities['228']='&auml;';entities['229']='&aring;';entities['230']='&aelig;';entities['231']='&ccedil;';entities['232']='&egrave;';entities['233']='&eacute;';entities['234']='&ecirc;';entities['235']='&euml;';entities['236']='&igrave;';entities['237']='&iacute;';entities['238']='&icirc;';entities['239']='&iuml;';entities['240']='&eth;';entities['241']='&ntilde;';entities['242']='&ograve;';entities['243']='&oacute;';entities['244']='&ocirc;';entities['245']='&otilde;';entities['246']='&ouml;';entities['247']='&divide;';entities['248']='&oslash;';entities['249']='&ugrave;';entities['250']='&uacute;';entities['251']='&ucirc;';entities['252']='&uuml;';entities['253']='&yacute;';entities['254']='&thorn;';entities['255']='&yuml;'}
if(useQuoteStyle!=='ENT_NOQUOTES'){entities['34']='&quot;'}
if(useQuoteStyle==='ENT_QUOTES'){entities['39']='&#39;'}
entities['60']='&lt;';entities['62']='&gt;';for(decimal in entities){if(entities.hasOwnProperty(decimal)){hash_map[String.fromCharCode(decimal)]=entities[decimal]}}
return hash_map}
i3.string.parseStr=function(string){if(i3.is(string,'string')!==!0)
return!1;var array=string.split('&');var o={};for(var i=0;i<array.length;i++){var split=array[i].split('=');i3.array.merge(o,i3.string.parseMap(decodeURIComponent(split[0]),split[1]?decodeURIComponent(split[1].replace(/\+/g,'%20')):'',o))}
return o}
i3.string.escapeJSON=function(string){if(i3.is(string,'string')!==!0)
return!1;return string.replace("\\","\\\\").replace("\"","\\\"").replace("\/","\\/").replace("\b","\\b").replace("\f","\\f").replace("\n","\\n").replace("\r","\\r").replace("\t","\\t").replace(/[\u007f-\uffff]/,function(c){return'\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4)})}
i3.string.parseMap=function(name,value,obj){if(!i3.is([name,value],'string'))
return!1;if(!obj)
obj={};var copy_obj=i3.extend(!0,{},obj);name=name.replace(/\]([^\[]+\[.*$)/,function(){return"]"});var occurrence=!0;name=name.replace(/\[\]/g,function(){if(occurrence){occurrence=!1;return"[]"}else return"[0]"});var string="{"+name.replace(/^[^\[]+$/,function(){return'"'+arguments[0]+'"'}).replace(/(^|\])([^\[]*)\[/g,function(){return arguments[1]+(arguments[1]&&arguments[2]?":{":"")+(arguments[2]?'"'+i3.string.escapeJSON(arguments[2])+'"':'')+'['}).replace(/\[(.*?)\]/gi,function(){if(arguments[1].length==0){var indexes=$(arguments[3].split("[")).map(function(){return i3.string.trim(this,['"',']'])}).toArray();var check_obj=i3.extend(!0,{},obj);var index=0;while(indexes.length>0){var label=indexes.shift();var empty=indexes.shift();if(empty.length==0)
while(indexes.length>0)
indexes.shift();else indexes.unshift(empty);if(check_obj[label]){if(indexes.length==0){index=$.grep(i3.array.keys(check_obj[label]),function(value){return i3.string.is(value,'int')?!0:!1}).length}else check_obj=check_obj[label]}else break}
return':{"'+index+'"'}else return':{"'+encodeURI(arguments[1])+'"'})+":"+(i3.is(value,'empty')?"\"\"":i3.string.is(value,'number')?value:'"'+value.replace(/[^\d\w]/gi,function(){return i3.string.escapeJSON(arguments[0])})+'"');string+=i3.string.repeat('}',i3.string.count(string,'{')-i3.string.count(string,'}'));var string_obj=i3.string.to(string,'object');if(i3.string.is(string,'json'))
i3.array.merge(copy_obj,string_obj);return copy_obj}
i3.string.random=function(length,seed){if(!i3.is(seed,'string'))
seed="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";var string="";for(var i=0;i<length;i++)
string+=seed.charAt(Math.random()*Math.pow(10,3)%seed.length);return string}
i3.string.first=function(string){if(i3.is(string,'string')!==!0)
return!1;var pos,min=string.length;for(var i=1;i<arguments.length;i++){if((pos=string.indexOf(arguments[i]))!=-1&&pos<min)
min=pos}
return min};i3.string.last=function(string){if(i3.is(string,'string')!==!0)
return!1;var pos,max=0;for(var i=1;i<arguments.length;i++)
if((pos=string.lastIndexOf(arguments[i]))!=-1&&pos>max)
max=pos;return max};i3.string.split=function(string){if(i3.is(string,'string')!==!0)
return!1;var ret=[string];for(var i=1;i<arguments.length;i++){if(!i3.is(arguments[i],'array'))
arguments[i]=new Array(arguments[i]);for(var j=0;j<arguments[i].length;j++)
for(var k=0;k<ret.length;k++)
ret=ret.shift().split(arguments[i][j]).concat(ret);}
return ret};i3.string.parseUrl=function(str,component){if(i3.is(str,'string')!==!0)
return!1;var o={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};var m=o.parser[o.strictMode?"strict":"loose"].exec(str),uri={},i=14;while(i--){uri[o.key[i]]=m[i]||""}
switch(component){case 'PHP_URL_SCHEME':return uri.protocol;case 'PHP_URL_HOST':return uri.host;case 'PHP_URL_PORT':return uri.port;case 'PHP_URL_USER':return uri.user;case 'PHP_URL_PASS':return uri.password;case 'PHP_URL_PATH':return uri.path;case 'PHP_URL_QUERY':return uri.query;case 'PHP_URL_FRAGMENT':return uri.anchor;default:var retArr={};if(uri.protocol!==''){retArr.scheme=uri.protocol}
if(uri.host!==''){retArr.host=uri.host}
if(uri.port!==''){retArr.port=uri.port}
if(uri.user!==''){retArr.user=uri.user}
if(uri.password!==''){retArr.pass=uri.password}
if(uri.path!==''){retArr.path=uri.path}
if(uri.query!==''){retArr.query=uri.query}
if(uri.anchor!==''){retArr.fragment=uri.anchor}
return retArr}}
i3.string.__base64={encodeChars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",decodeChars:[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1]}
i3.string.btoa=function(str){if(window.btoa)
return window.btoa(str);var out,i,len;var c1,c2,c3;len=str.length;i=0;out="";while(i<len){c1=str.charCodeAt(i++)&0xff;if(i==len){out+=i3.string.__base64.encodeChars.charAt(c1>>2);out+=i3.string.__base64.encodeChars.charAt((c1&0x3)<<4);out+="==";break}
c2=str.charCodeAt(i++);if(i==len){out+=i3.string.__base64.encodeChars.charAt(c1>>2);out+=i3.string.__base64.encodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));out+=i3.string.__base64.encodeChars.charAt((c2&0xF)<<2);out+="=";break}
c3=str.charCodeAt(i++);out+=i3.string.__base64.encodeChars.charAt(c1>>2);out+=i3.string.__base64.encodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));out+=i3.string.__base64.encodeChars.charAt(((c2&0xF)<<2)|((c3&0xC0)>>6));out+=i3.string.__base64.encodeChars.charAt(c3&0x3F)}
return out}
i3.string.atob=function(str){if(window.atob)
return window.atob(str);var c1,c2,c3,c4;var i,len,out;len=str.length;i=0;out="";while(i<len){do{c1=i3.string.__base64.decodeChars[str.charCodeAt(i++)&0xff]}while(i<len&&c1==-1);if(c1==-1)
break;do{c2=i3.string.__base64.decodeChars[str.charCodeAt(i++)&0xff]}while(i<len&&c2==-1);if(c2==-1)
break;out+=String.fromCharCode((c1<<2)|((c2&0x30)>>4));do{c3=str.charCodeAt(i++)&0xff;if(c3==61)
return out;c3=i3.string.__base64.decodeChars[c3]}while(i<len&&c3==-1);if(c3==-1)
break;out+=String.fromCharCode(((c2&0XF)<<4)|((c3&0x3C)>>2));do{c4=str.charCodeAt(i++)&0xff;if(c4==61)
return out;c4=i3.string.__base64.decodeChars[c4]}while(i<len&&c4==-1);if(c4==-1)
break;out+=String.fromCharCode(((c3&0x03)<<6)|c4)}
return out}
i3.string.numberFormat=function(string,params){if(!i3.is(string,['string','number']))
return!1;params=i3.extend(!0,{decimals:2,separator:',',point:'.'},params);string=String(string).replace(/[^0-9+\-Ee.]/g,'');var n=!isFinite(+string)?0:+string,s='',toFixedFix=function(n,dec){var k=Math.pow(10,dec);return''+Math.round(n*k)/k};s=(params.decimals?toFixedFix(n,params.decimals):''+Math.round(n)).split('.');if(s[0].length>3)
s[0]=s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g,params.separator);if((s[1]||'').length<params.decimals){s[1]=s[1]||'';s[1]+=new Array(params.decimals-s[1].length+1).join('0')}
return s.join(params.point)}
i3.string.filesize=function(string,params){if(!i3.is(string,['string','number']))
return!1;params=i3.extend(!0,{si:!0},params);var bytes=parseInt(string);var thresh=params.si?1000:1024;if(Math.abs(bytes)<thresh){return bytes+' B'}
var units=params.si?['kB','MB','GB','TB','PB','EB','ZB','YB']:['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];var u=-1;do{bytes/=thresh;++u}while(Math.abs(bytes)>=thresh&&u<units.length-1);return bytes.toFixed(1)+' '+units[u]}
i3.string.compare=function(string1,string2){if(!i3.is([string1,string2],'string'))
return!1;var arr=string2.split(":");if(string1.search("^"+arr[0])===-1)
return!1;for(var i=1;i<arr.length;i++){var expr=i3.string.between(arr[i],null,'(');var val=i3.string.between(arr[i],'(',')');switch(expr){case 'not':if(string1.search(val)!==-1)
return!1;break}}
return!0}
i3.string.pregQuote=function(string,delimiter){if(!i3.is(string,'string'))
return!1;return string.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\'+(delimiter||'/')+'-]','g'),'\\$&')}
i3.string.is=function(string,type){if(!i3.is(string,'string'))
return!1;if(i3.type(string)=="array"){for(var i in string)
if(i3.is(string[i],type))
return!0;return!1}
if(i3.type(type)=="array"){for(var i in type)
if(i3.string.is(string,type[i]))
return!0}
switch(type){case 'float':case 'int':case 'number':return i3.is(parseFloat(string),type)&&String(parseFloat(string))===string;break;case 'boolean':return string.toLowerCase()=='true'||string.toLowerCase()=='false';break;case 'node':return i3("_").html(string).children().length>0;break;case 'null':return string.toLowerCase()=='null'||string.toLowerCase()=='undefined';break;case 'empty':return i3.string.trim(string,"\\s").length==0;break;case 'function':return i3.is(i3.string.to(string,'function'),'function');break;case 'url':return new RegExp("^"+"(?:(?:https?|ftp)://)"+"(?:\\S+(?::\\S*)?@)?"+"(?:"+"(?!(?:10|127)(?:\\.\\d{1,3}){3})"+"(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})"+"(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})"+"(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])"+"(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}"+"(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))"+"|"+"(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)"+"(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*"+"(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))"+")"+"(?::\\d{2,5})?"+"(?:/\\S*)?"+"$","i").test(string);break;case 'json':try{if(JSON.parse(string))
return!0;else return!1}catch(e){return!1}
break;case 'selector':var ns=document.styleSheets[0];if(!ns||ns.href){var head=document.getElementsByTagName('head')[0];head.insertBefore(document.createElement('style'),head.firstChild);ns=document.styleSheets[0]}
try{if(ns.addRule){ns.addRule(string," ");ns.removeRule(0)}else{ns.insertRule(string+" {}",0);ns.deleteRule(0)}
return!0}catch(e){return!1}
break}
return!1}
i3.string.to=function(string,type,params){if(!i3.is(string,'string'))
return!1;if(!i3.is(params,['object','node','jquery']))
params={};switch(type){case 'float':case 'number':if(i3.string.is(string,type))
return parseFloat(string);break;case 'int':if(i3.string.is(string,type))
return parseInt(string);break;case 'camelcase':return string.toLowerCase().replace(/[\-\_](.)/g,function(m,l){return l.toUpperCase()});break;case 'propercase':return string.replace(/([A-Z])/g,function(l){return"-"+l.toLowerCase()});break;case 'boolean':if(i3.string.is(string,type))
return string.toLowerCase()=="true";break;case 'null':if(i3(string).type('string',type))
return null;break;case 'node':if(string.match(/\bthis\b/g)){var fun=i3.string.to("function (__this__) { return "+string.replace(/\bthis\b/g,"__this__")+"}",'function');return i3.is(fun,'function')?i3(fun(params)):!1}else{var fun=i3.string.to("function() { return "+string+"}",'function');return i3.is(fun,'function')?i3(fun(params)):i3(string)}
break;case 'base64':return i3.string.btoa(string);break;case 'array':if(i3.is(string,'empty'))
return[];else if(i3.string.is(string,'json'))
return i3.string.to(string,'object');else return i3.string.parseStr(string);break;case 'entities':var hash_map=i3.string.getHtmlTranslationTable('HTML_ENTITIES',params.quoteStyle);var symbol='';if(!hash_map)return!1;if(params.quoteStyle&&params.quoteStyle==='ENT_QUOTES')
hash_map["'"]='&#039;';if(!!params.doubleEncode||params.doubleEncode==null){for(symbol in hash_map)
if(hash_map.hasOwnProperty(symbol))
string=string.split(symbol).join(hash_map[symbol]);}else string=string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g,function(ignore,text,entity){for(symbol in hash_map)
if(hash_map.hasOwnProperty(symbol))
text=text.split(symbol).join(hash_map[symbol]);return text+entity});break;case 'function':if(i3.string.is(string,'empty'))
return!1;try{if(string.indexOf("f:")===0){var params=string.split(":");return Function("return function(){var args = [].splice.call(arguments,0).concat("+i3.array.to(params.slice(2),"json")+"); "+params[1]+".apply(null, args);}")()}else{var parse=string.replace(/\/\/[^\n]+/g,'');return Function("return "+parse)()}}catch(e){return!1}
break;case 'object':if(i3.is(string,'empty'))
return{};if(i3.string.is(string,'json'))
return i3.secureEvalJSON?i3.secureEvalJSON(string):Function("return "+i3.string.trim(string))();var parse=i3.string.parse(string);if(parse&&i3.string.is(parse,'json'))
return Function("return "+parse)();break}
return!1};i3.string.substitute=function(input,list){var output=input+"";$.each(list,function(key,value){output=output.replace(new RegExp("\\[\\[ "+key+" \\]\\]","g"),value)});return output}