import{p as $e}from"./chunk-U6PWSEAI.mjs";import{a as ti}from"./chunk-MA7QUKCW.mjs";import{N as le,O as ue,T as de,U as fe,V as he,W as me,X as ke,Y as ye,Z as ge,_ as ct}from"./chunk-PI4FTPSL.mjs";import{A as Ie,B as Ot,C as Wt,D as Ye,a as ce,b as nt,d as pe,e as ve,f as Te,g as be,h as Tt,i as xe,o as we,p as Yt,q as $t,r as Lt,s as At,t as Ft,u as _e,v as De,w as Se,x as Ce,y as Me,z as Ee}from"./chunk-OOVTRAKB.mjs";import{a as l}from"./chunk-L27A2YCO.mjs";import{a as D,c as _t,d as ot}from"./chunk-SP2CHFBE.mjs";var Le=_t((Vt,Pt)=>{"use strict";(function(t,e){typeof Vt=="object"&&typeof Pt<"u"?Pt.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_isoWeek=e()})(Vt,(function(){"use strict";var t="day";return function(e,n,s){var r=D(function(w){return w.add(4-w.isoWeekday(),t)},"a"),f=n.prototype;f.isoWeekYear=function(){return r(this).year()},f.isoWeek=function(w){if(!this.$utils().u(w))return this.add(7*(w-this.isoWeek()),t);var C,R,$,H,z=r(this),B=(C=this.isoWeekYear(),R=this.$u,$=(R?s.utc:s)().year(C).startOf("year"),H=4-$.isoWeekday(),$.isoWeekday()>4&&(H+=7),$.add(H,t));return z.diff(B,"week")+1},f.isoWeekday=function(w){return this.$utils().u(w)?this.day()||7:this.day(this.day()%7?w:w-7)};var y=f.startOf;f.startOf=function(w,C){var R=this.$utils(),$=!!R.u(C)||C;return R.p(w)==="isoweek"?$?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):y.bind(this)(w,C)}}}))});var Ae=_t((Nt,Rt)=>{"use strict";(function(t,e){typeof Nt=="object"&&typeof Rt<"u"?Rt.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_customParseFormat=e()})(Nt,(function(){"use strict";var t={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},e=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,n=/\d/,s=/\d\d/,r=/\d\d?/,f=/\d*[^-_:/,()\s\d]+/,y={},w=D(function(x){return(x=+x)+(x>68?1900:2e3)},"a"),C=D(function(x){return function(_){this[x]=+_}},"f"),R=[/[+-]\d\d:?(\d\d)?|Z/,function(x){(this.zone||(this.zone={})).offset=(function(_){if(!_||_==="Z")return 0;var b=_.match(/([+-]|\d\d)/g),F=60*b[1]+(+b[2]||0);return F===0?0:b[0]==="+"?-F:F})(x)}],$=D(function(x){var _=y[x];return _&&(_.indexOf?_:_.s.concat(_.f))},"u"),H=D(function(x,_){var b,F=y.meridiem;if(F){for(var U=1;U<=24;U+=1)if(x.indexOf(F(U,0,_))>-1){b=U>12;break}}else b=x===(_?"pm":"PM");return b},"d"),z={A:[f,function(x){this.afternoon=H(x,!1)}],a:[f,function(x){this.afternoon=H(x,!0)}],Q:[n,function(x){this.month=3*(x-1)+1}],S:[n,function(x){this.milliseconds=100*+x}],SS:[s,function(x){this.milliseconds=10*+x}],SSS:[/\d{3}/,function(x){this.milliseconds=+x}],s:[r,C("seconds")],ss:[r,C("seconds")],m:[r,C("minutes")],mm:[r,C("minutes")],H:[r,C("hours")],h:[r,C("hours")],HH:[r,C("hours")],hh:[r,C("hours")],D:[r,C("day")],DD:[s,C("day")],Do:[f,function(x){var _=y.ordinal,b=x.match(/\d+/);if(this.day=b[0],_)for(var F=1;F<=31;F+=1)_(F).replace(/\[|\]/g,"")===x&&(this.day=F)}],w:[r,C("week")],ww:[s,C("week")],M:[r,C("month")],MM:[s,C("month")],MMM:[f,function(x){var _=$("months"),b=($("monthsShort")||_.map((function(F){return F.slice(0,3)}))).indexOf(x)+1;if(b<1)throw new Error;this.month=b%12||b}],MMMM:[f,function(x){var _=$("months").indexOf(x)+1;if(_<1)throw new Error;this.month=_%12||_}],Y:[/[+-]?\d+/,C("year")],YY:[s,function(x){this.year=w(x)}],YYYY:[/\d{4}/,C("year")],Z:R,ZZ:R};function B(x){var _,b;_=x,b=y&&y.formats;for(var F=(x=_.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(V,O,k){var p=k&&k.toUpperCase();return O||b[k]||t[k]||b[p].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(v,T,a){return T||a.slice(1)}))}))).match(e),U=F.length,q=0;q<U;q+=1){var L=F[q],g=z[L],m=g&&g[0],Y=g&&g[1];F[q]=Y?{regex:m,parser:Y}:L.replace(/^\[|\]$/g,"")}return function(V){for(var O={},k=0,p=0;k<U;k+=1){var v=F[k];if(typeof v=="string")p+=v.length;else{var T=v.regex,a=v.parser,h=V.slice(p),d=T.exec(h)[0];a.call(O,d),V=V.replace(d,"")}}return(function(u){var M=u.afternoon;if(M!==void 0){var i=u.hours;M?i<12&&(u.hours+=12):i===12&&(u.hours=0),delete u.afternoon}})(O),O}}return D(B,"l"),function(x,_,b){b.p.customParseFormat=!0,x&&x.parseTwoDigitYear&&(w=x.parseTwoDigitYear);var F=_.prototype,U=F.parse;F.parse=function(q){var L=q.date,g=q.utc,m=q.args;this.$u=g;var Y=m[1];if(typeof Y=="string"){var V=m[2]===!0,O=m[3]===!0,k=V||O,p=m[2];O&&(p=m[2]),y=this.$locale(),!V&&p&&(y=b.Ls[p]),this.$d=(function(h,d,u,M){try{if(["x","X"].indexOf(d)>-1)return new Date((d==="X"?1e3:1)*h);var i=B(d)(h),E=i.year,c=i.month,j=i.day,o=i.hours,S=i.minutes,I=i.seconds,P=i.milliseconds,N=i.zone,A=i.week,W=new Date,et=j||(E||c?1:W.getDate()),it=E||W.getFullYear(),ut=0;E&&!c||(ut=c>0?c-1:W.getMonth());var dt,ft=o||0,G=S||0,at=I||0,J=P||0;return N?new Date(Date.UTC(it,ut,et,ft,G,at,J+60*N.offset*1e3)):u?new Date(Date.UTC(it,ut,et,ft,G,at,J)):(dt=new Date(it,ut,et,ft,G,at,J),A&&(dt=M(dt).week(A).toDate()),dt)}catch{return new Date("")}})(L,Y,g,b),this.init(),p&&p!==!0&&(this.$L=this.locale(p).$L),k&&L!=this.format(Y)&&(this.$d=new Date("")),y={}}else if(Y instanceof Array)for(var v=Y.length,T=1;T<=v;T+=1){m[1]=Y[T-1];var a=b.apply(this,m);if(a.isValid()){this.$d=a.$d,this.$L=a.$L,this.init();break}T===v&&(this.$d=new Date(""))}else U.call(this,q)}}}))});var Fe=_t((zt,Ht)=>{"use strict";(function(t,e){typeof zt=="object"&&typeof Ht<"u"?Ht.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_advancedFormat=e()})(zt,(function(){"use strict";return function(t,e){var n=e.prototype,s=n.format;n.format=function(r){var f=this,y=this.$locale();if(!this.isValid())return s.bind(this)(r);var w=this.$utils(),C=(r||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(R){switch(R){case"Q":return Math.ceil((f.$M+1)/3);case"Do":return y.ordinal(f.$D);case"gggg":return f.weekYear();case"GGGG":return f.isoWeekYear();case"wo":return y.ordinal(f.week(),"W");case"w":case"ww":return w.s(f.week(),R==="w"?1:2,"0");case"W":case"WW":return w.s(f.isoWeek(),R==="W"?1:2,"0");case"k":case"kk":return w.s(String(f.$H===0?24:f.$H),R==="k"?1:2,"0");case"X":return Math.floor(f.$d.getTime()/1e3);case"x":return f.$d.getTime();case"z":return"["+f.offsetName()+"]";case"zzz":return"["+f.offsetName("long")+"]";default:return R}}));return s.bind(this)(C)}}}))});var Oe=_t((Bt,jt)=>{"use strict";(function(t,e){typeof Bt=="object"&&typeof jt<"u"?jt.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_duration=e()})(Bt,(function(){"use strict";var t,e,n=1e3,s=6e4,r=36e5,f=864e5,y=31536e6,w=2628e6,C=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,R=/\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g,$={years:y,months:w,days:f,hours:r,minutes:s,seconds:n,milliseconds:1,weeks:6048e5},H=D(function(L){return L instanceof U},"c"),z=D(function(L,g,m){return new U(L,m,g.$l)},"f"),B=D(function(L){return e.p(L)+"s"},"m"),x=D(function(L){return L<0},"l"),_=D(function(L){return x(L)?Math.ceil(L):Math.floor(L)},"$"),b=D(function(L){return Math.abs(L)},"y"),F=D(function(L,g){return L?x(L)?{negative:!0,format:""+b(L)+g}:{negative:!1,format:""+L+g}:{negative:!1,format:""}},"v"),U=(function(){function L(m,Y,V){var O=this;if(this.$d={},this.$l=V,m===void 0&&(this.$ms=0,this.parseFromMilliseconds()),Y)return z(m*$[B(Y)],this);if(typeof m=="number")return this.$ms=m,this.parseFromMilliseconds(),this;if(typeof m=="object")return Object.keys(m).forEach((function(v){O.$d[B(v)]=m[v]})),this.calMilliseconds(),this;if(typeof m=="string"){var k=m.match(C);if(k){var p=k.slice(2).map((function(v){return v!=null?Number(v):0}));return this.$d.years=p[0],this.$d.months=p[1],this.$d.weeks=p[2],this.$d.days=p[3],this.$d.hours=p[4],this.$d.minutes=p[5],this.$d.seconds=p[6],this.calMilliseconds(),this}}return this}D(L,"l");var g=L.prototype;return g.calMilliseconds=function(){var m=this;this.$ms=Object.keys(this.$d).reduce((function(Y,V){return Y+(m.$d[V]||0)*$[V]}),0)},g.parseFromMilliseconds=function(){var m=this.$ms;this.$d.years=_(m/y),m%=y,this.$d.months=_(m/w),m%=w,this.$d.days=_(m/f),m%=f,this.$d.hours=_(m/r),m%=r,this.$d.minutes=_(m/s),m%=s,this.$d.seconds=_(m/n),m%=n,this.$d.milliseconds=m},g.toISOString=function(){var m=F(this.$d.years,"Y"),Y=F(this.$d.months,"M"),V=+this.$d.days||0;this.$d.weeks&&(V+=7*this.$d.weeks);var O=F(V,"D"),k=F(this.$d.hours,"H"),p=F(this.$d.minutes,"M"),v=this.$d.seconds||0;this.$d.milliseconds&&(v+=this.$d.milliseconds/1e3,v=Math.round(1e3*v)/1e3);var T=F(v,"S"),a=m.negative||Y.negative||O.negative||k.negative||p.negative||T.negative,h=k.format||p.format||T.format?"T":"",d=(a?"-":"")+"P"+m.format+Y.format+O.format+h+k.format+p.format+T.format;return d==="P"||d==="-P"?"P0D":d},g.toJSON=function(){return this.toISOString()},g.format=function(m){var Y=m||"YYYY-MM-DDTHH:mm:ss",V={Y:this.$d.years,YY:e.s(this.$d.years,2,"0"),YYYY:e.s(this.$d.years,4,"0"),M:this.$d.months,MM:e.s(this.$d.months,2,"0"),D:this.$d.days,DD:e.s(this.$d.days,2,"0"),H:this.$d.hours,HH:e.s(this.$d.hours,2,"0"),m:this.$d.minutes,mm:e.s(this.$d.minutes,2,"0"),s:this.$d.seconds,ss:e.s(this.$d.seconds,2,"0"),SSS:e.s(this.$d.milliseconds,3,"0")};return Y.replace(R,(function(O,k){return k||String(V[O])}))},g.as=function(m){return this.$ms/$[B(m)]},g.get=function(m){var Y=this.$ms,V=B(m);return V==="milliseconds"?Y%=1e3:Y=V==="weeks"?_(Y/$[V]):this.$d[V],Y||0},g.add=function(m,Y,V){var O;return O=Y?m*$[B(Y)]:H(m)?m.$ms:z(m,this).$ms,z(this.$ms+O*(V?-1:1),this)},g.subtract=function(m,Y){return this.add(m,Y,!0)},g.locale=function(m){var Y=this.clone();return Y.$l=m,Y},g.clone=function(){return z(this.$ms,this)},g.humanize=function(m){return t().add(this.$ms,"ms").locale(this.$l).fromNow(!m)},g.valueOf=function(){return this.asMilliseconds()},g.milliseconds=function(){return this.get("milliseconds")},g.asMilliseconds=function(){return this.as("milliseconds")},g.seconds=function(){return this.get("seconds")},g.asSeconds=function(){return this.as("seconds")},g.minutes=function(){return this.get("minutes")},g.asMinutes=function(){return this.as("minutes")},g.hours=function(){return this.get("hours")},g.asHours=function(){return this.as("hours")},g.days=function(){return this.get("days")},g.asDays=function(){return this.as("days")},g.weeks=function(){return this.get("weeks")},g.asWeeks=function(){return this.as("weeks")},g.months=function(){return this.get("months")},g.asMonths=function(){return this.as("months")},g.years=function(){return this.get("years")},g.asYears=function(){return this.as("years")},L})(),q=D(function(L,g,m){return L.add(g.years()*m,"y").add(g.months()*m,"M").add(g.days()*m,"d").add(g.hours()*m,"h").add(g.minutes()*m,"m").add(g.seconds()*m,"s").add(g.milliseconds()*m,"ms")},"p");return function(L,g,m){t=m,e=m().$utils(),m.duration=function(O,k){var p=m.locale();return z(O,{$l:p},k)},m.isDuration=H;var Y=g.prototype.add,V=g.prototype.subtract;g.prototype.add=function(O,k){return H(O)?q(this,O,1):Y.bind(this)(O,k)},g.prototype.subtract=function(O,k){return H(O)?q(this,O,-1):V.bind(this)(O,k)}}}))});var Ne=ot(ti(),1),K=ot(ce(),1),Re=ot(Le(),1),ze=ot(Ae(),1),He=ot(Fe(),1),kt=ot(ce(),1),Je=ot(Oe(),1);var Xt=(function(){var t=l(function(T,a,h,d){for(h=h||{},d=T.length;d--;h[T[d]]=a);return h},"o"),e=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],n=[1,26],s=[1,27],r=[1,28],f=[1,29],y=[1,30],w=[1,31],C=[1,32],R=[1,33],$=[1,34],H=[1,9],z=[1,10],B=[1,11],x=[1,12],_=[1,13],b=[1,14],F=[1,15],U=[1,16],q=[1,19],L=[1,20],g=[1,21],m=[1,22],Y=[1,23],V=[1,25],O=[1,35],k={trace:l(D(function(){},"trace"),"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:l(D(function(a,h,d,u,M,i,E){var c=i.length-1;switch(M){case 1:return i[c-1];case 2:this.$=[];break;case 3:i[c-1].push(i[c]),this.$=i[c-1];break;case 4:case 5:this.$=i[c];break;case 6:case 7:this.$=[];break;case 8:u.setWeekday("monday");break;case 9:u.setWeekday("tuesday");break;case 10:u.setWeekday("wednesday");break;case 11:u.setWeekday("thursday");break;case 12:u.setWeekday("friday");break;case 13:u.setWeekday("saturday");break;case 14:u.setWeekday("sunday");break;case 15:u.setWeekend("friday");break;case 16:u.setWeekend("saturday");break;case 17:u.setDateFormat(i[c].substr(11)),this.$=i[c].substr(11);break;case 18:u.enableInclusiveEndDates(),this.$=i[c].substr(18);break;case 19:u.TopAxis(),this.$=i[c].substr(8);break;case 20:u.setAxisFormat(i[c].substr(11)),this.$=i[c].substr(11);break;case 21:u.setTickInterval(i[c].substr(13)),this.$=i[c].substr(13);break;case 22:u.setExcludes(i[c].substr(9)),this.$=i[c].substr(9);break;case 23:u.setIncludes(i[c].substr(9)),this.$=i[c].substr(9);break;case 24:u.setTodayMarker(i[c].substr(12)),this.$=i[c].substr(12);break;case 27:u.setDiagramTitle(i[c].substr(6)),this.$=i[c].substr(6);break;case 28:this.$=i[c].trim(),u.setAccTitle(this.$);break;case 29:case 30:this.$=i[c].trim(),u.setAccDescription(this.$);break;case 31:u.addSection(i[c].substr(8)),this.$=i[c].substr(8);break;case 33:u.addTask(i[c-1],i[c]),this.$="task";break;case 34:this.$=i[c-1],u.setClickEvent(i[c-1],i[c],null);break;case 35:this.$=i[c-2],u.setClickEvent(i[c-2],i[c-1],i[c]);break;case 36:this.$=i[c-2],u.setClickEvent(i[c-2],i[c-1],null),u.setLink(i[c-2],i[c]);break;case 37:this.$=i[c-3],u.setClickEvent(i[c-3],i[c-2],i[c-1]),u.setLink(i[c-3],i[c]);break;case 38:this.$=i[c-2],u.setClickEvent(i[c-2],i[c],null),u.setLink(i[c-2],i[c-1]);break;case 39:this.$=i[c-3],u.setClickEvent(i[c-3],i[c-1],i[c]),u.setLink(i[c-3],i[c-2]);break;case 40:this.$=i[c-1],u.setLink(i[c-1],i[c]);break;case 41:case 47:this.$=i[c-1]+" "+i[c];break;case 42:case 43:case 45:this.$=i[c-2]+" "+i[c-1]+" "+i[c];break;case 44:case 46:this.$=i[c-3]+" "+i[c-2]+" "+i[c-1]+" "+i[c];break}},"anonymous"),"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:n,13:s,14:r,15:f,16:y,17:w,18:C,19:18,20:R,21:$,22:H,23:z,24:B,25:x,26:_,27:b,28:F,29:U,30:q,31:L,33:g,35:m,36:Y,37:24,38:V,40:O},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:36,11:17,12:n,13:s,14:r,15:f,16:y,17:w,18:C,19:18,20:R,21:$,22:H,23:z,24:B,25:x,26:_,27:b,28:F,29:U,30:q,31:L,33:g,35:m,36:Y,37:24,38:V,40:O},t(e,[2,5]),t(e,[2,6]),t(e,[2,17]),t(e,[2,18]),t(e,[2,19]),t(e,[2,20]),t(e,[2,21]),t(e,[2,22]),t(e,[2,23]),t(e,[2,24]),t(e,[2,25]),t(e,[2,26]),t(e,[2,27]),{32:[1,37]},{34:[1,38]},t(e,[2,30]),t(e,[2,31]),t(e,[2,32]),{39:[1,39]},t(e,[2,8]),t(e,[2,9]),t(e,[2,10]),t(e,[2,11]),t(e,[2,12]),t(e,[2,13]),t(e,[2,14]),t(e,[2,15]),t(e,[2,16]),{41:[1,40],43:[1,41]},t(e,[2,4]),t(e,[2,28]),t(e,[2,29]),t(e,[2,33]),t(e,[2,34],{42:[1,42],43:[1,43]}),t(e,[2,40],{41:[1,44]}),t(e,[2,35],{43:[1,45]}),t(e,[2,36]),t(e,[2,38],{42:[1,46]}),t(e,[2,37]),t(e,[2,39])],defaultActions:{},parseError:l(D(function(a,h){if(h.recoverable)this.trace(a);else{var d=new Error(a);throw d.hash=h,d}},"parseError"),"parseError"),parse:l(D(function(a){var h=this,d=[0],u=[],M=[null],i=[],E=this.table,c="",j=0,o=0,S=0,I=2,P=1,N=i.slice.call(arguments,1),A=Object.create(this.lexer),W={yy:{}};for(var et in this.yy)Object.prototype.hasOwnProperty.call(this.yy,et)&&(W.yy[et]=this.yy[et]);A.setInput(a,W.yy),W.yy.lexer=A,W.yy.parser=this,typeof A.yylloc>"u"&&(A.yylloc={});var it=A.yylloc;i.push(it);var ut=A.options&&A.options.ranges;typeof W.yy.parseError=="function"?this.parseError=W.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function dt(Q){d.length=d.length-2*Q,M.length=M.length-Q,i.length=i.length-Q}D(dt,"popStack"),l(dt,"popStack");function ft(){var Q;return Q=u.pop()||A.lex()||P,typeof Q!="number"&&(Q instanceof Array&&(u=Q,Q=u.pop()),Q=h.symbols_[Q]||Q),Q}D(ft,"lex"),l(ft,"lex");for(var G,at,J,Z,ji,Et,ht={},xt,st,oe,wt;;){if(J=d[d.length-1],this.defaultActions[J]?Z=this.defaultActions[J]:((G===null||typeof G>"u")&&(G=ft()),Z=E[J]&&E[J][G]),typeof Z>"u"||!Z.length||!Z[0]){var It="";wt=[];for(xt in E[J])this.terminals_[xt]&&xt>I&&wt.push("'"+this.terminals_[xt]+"'");A.showPosition?It="Parse error on line "+(j+1)+`:
`+A.showPosition()+`
Expecting `+wt.join(", ")+", got '"+(this.terminals_[G]||G)+"'":It="Parse error on line "+(j+1)+": Unexpected "+(G==P?"end of input":"'"+(this.terminals_[G]||G)+"'"),this.parseError(It,{text:A.match,token:this.terminals_[G]||G,line:A.yylineno,loc:it,expected:wt})}if(Z[0]instanceof Array&&Z.length>1)throw new Error("Parse Error: multiple actions possible at state: "+J+", token: "+G);switch(Z[0]){case 1:d.push(G),M.push(A.yytext),i.push(A.yylloc),d.push(Z[1]),G=null,at?(G=at,at=null):(o=A.yyleng,c=A.yytext,j=A.yylineno,it=A.yylloc,S>0&&S--);break;case 2:if(st=this.productions_[Z[1]][1],ht.$=M[M.length-st],ht._$={first_line:i[i.length-(st||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(st||1)].first_column,last_column:i[i.length-1].last_column},ut&&(ht._$.range=[i[i.length-(st||1)].range[0],i[i.length-1].range[1]]),Et=this.performAction.apply(ht,[c,o,j,W.yy,Z[1],M,i].concat(N)),typeof Et<"u")return Et;st&&(d=d.slice(0,-1*st*2),M=M.slice(0,-1*st),i=i.slice(0,-1*st)),d.push(this.productions_[Z[1]][0]),M.push(ht.$),i.push(ht._$),oe=E[d[d.length-2]][d[d.length-1]],d.push(oe);break;case 3:return!0}}return!0},"parse"),"parse")},p=(function(){var T={EOF:1,parseError:l(D(function(h,d){if(this.yy.parser)this.yy.parser.parseError(h,d);else throw new Error(h)},"parseError"),"parseError"),setInput:l(function(a,h){return this.yy=h||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:l(function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var h=a.match(/(?:\r\n?|\n).*/g);return h?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},"input"),unput:l(function(a){var h=a.length,d=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-h),this.offset-=h;var u=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),d.length-1&&(this.yylineno-=d.length-1);var M=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:d?(d.length===u.length?this.yylloc.first_column:0)+u[u.length-d.length].length-d[0].length:this.yylloc.first_column-h},this.options.ranges&&(this.yylloc.range=[M[0],M[0]+this.yyleng-h]),this.yyleng=this.yytext.length,this},"unput"),more:l(function(){return this._more=!0,this},"more"),reject:l(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:l(function(a){this.unput(this.match.slice(a))},"less"),pastInput:l(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:l(function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:l(function(){var a=this.pastInput(),h=new Array(a.length+1).join("-");return a+this.upcomingInput()+`
`+h+"^"},"showPosition"),test_match:l(function(a,h){var d,u,M;if(this.options.backtrack_lexer&&(M={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(M.yylloc.range=this.yylloc.range.slice(0))),u=a[0].match(/(?:\r\n?|\n).*/g),u&&(this.yylineno+=u.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:u?u[u.length-1].length-u[u.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],d=this.performAction.call(this,this.yy,this,h,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),d)return d;if(this._backtrack){for(var i in M)this[i]=M[i];return!1}return!1},"test_match"),next:l(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,h,d,u;this._more||(this.yytext="",this.match="");for(var M=this._currentRules(),i=0;i<M.length;i++)if(d=this._input.match(this.rules[M[i]]),d&&(!h||d[0].length>h[0].length)){if(h=d,u=i,this.options.backtrack_lexer){if(a=this.test_match(d,M[i]),a!==!1)return a;if(this._backtrack){h=!1;continue}else return!1}else if(!this.options.flex)break}return h?(a=this.test_match(h,M[u]),a!==!1?a:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:l(D(function(){var h=this.next();return h||this.lex()},"lex"),"lex"),begin:l(D(function(h){this.conditionStack.push(h)},"begin"),"begin"),popState:l(D(function(){var h=this.conditionStack.length-1;return h>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),"popState"),_currentRules:l(D(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),"_currentRules"),topState:l(D(function(h){return h=this.conditionStack.length-1-Math.abs(h||0),h>=0?this.conditionStack[h]:"INITIAL"},"topState"),"topState"),pushState:l(D(function(h){this.begin(h)},"pushState"),"pushState"),stateStackSize:l(D(function(){return this.conditionStack.length},"stateStackSize"),"stateStackSize"),options:{"case-insensitive":!0},performAction:l(D(function(h,d,u,M){var i=M;switch(u){case 0:return this.begin("open_directive"),"open_directive";break;case 1:return this.begin("acc_title"),31;break;case 2:return this.popState(),"acc_title_value";break;case 3:return this.begin("acc_descr"),33;break;case 4:return this.popState(),"acc_descr_value";break;case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return T})();k.lexer=p;function v(){this.yy={}}return D(v,"Parser"),l(v,"Parser"),v.prototype=k,k.Parser=v,new v})();Xt.parser=Xt;var ei=Xt;K.default.extend(Re.default);K.default.extend(ze.default);K.default.extend(He.default);var We={friday:5,saturday:6},tt="",Qt="",Kt=void 0,Jt="",gt=[],pt=[],te=new Map,ee=[],Ct=[],vt="",ie="",Be=["active","done","crit","milestone","vert"],se=[],mt="",bt=!1,re=!1,ne="sunday",Mt="saturday",Ut=0,ii=l(function(){ee=[],Ct=[],vt="",se=[],Dt=0,Zt=void 0,St=void 0,X=[],tt="",Qt="",ie="",Kt=void 0,Jt="",gt=[],pt=[],bt=!1,re=!1,Ut=0,te=new Map,mt="",de(),ne="sunday",Mt="saturday"},"clear"),si=l(function(t){mt=t},"setDiagramId"),ri=l(function(t){Qt=t},"setAxisFormat"),ni=l(function(){return Qt},"getAxisFormat"),ai=l(function(t){Kt=t},"setTickInterval"),oi=l(function(){return Kt},"getTickInterval"),ci=l(function(t){Jt=t},"setTodayMarker"),li=l(function(){return Jt},"getTodayMarker"),ui=l(function(t){tt=t},"setDateFormat"),di=l(function(){bt=!0},"enableInclusiveEndDates"),fi=l(function(){return bt},"endDatesAreInclusive"),hi=l(function(){re=!0},"enableTopAxis"),mi=l(function(){return re},"topAxisEnabled"),ki=l(function(t){ie=t},"setDisplayMode"),yi=l(function(){return ie},"getDisplayMode"),gi=l(function(){return tt},"getDateFormat"),je=l((t,e)=>{let n=e.toLowerCase().split(/[\s,]+/).filter(s=>s!=="");return[...new Set([...t,...n])]},"mergeTokens"),pi=l(function(t){gt=je(gt,t)},"setIncludes"),vi=l(function(){return gt},"getIncludes"),Ti=l(function(t){pt=je(pt,t)},"setExcludes"),bi=l(function(){return pt},"getExcludes"),xi=l(function(){return te},"getLinks"),wi=l(function(t){vt=t,ee.push(t)},"addSection"),_i=l(function(){return ee},"getSections"),Di=l(function(){let t=Ve(),e=10,n=0;for(;!t&&n<e;)t=Ve(),n++;return Ct=X,Ct},"getTasks"),Ge=l(function(t,e,n,s){let r=t.format(e.trim()),f=t.format("YYYY-MM-DD");return s.includes(r)||s.includes(f)?!1:n.includes("weekends")&&(t.isoWeekday()===We[Mt]||t.isoWeekday()===We[Mt]+1)||n.includes(t.format("dddd").toLowerCase())?!0:n.includes(r)||n.includes(f)},"isInvalidDate"),Si=l(function(t){ne=t},"setWeekday"),Ci=l(function(){return ne},"getWeekday"),Mi=l(function(t){Mt=t},"setWeekend"),Xe=l(function(t,e,n,s){if(!n.length||t.manualEndTime)return;let r;t.startTime instanceof Date?r=(0,K.default)(t.startTime):r=(0,K.default)(t.startTime,e,!0),r=r.add(1,"d");let f;t.endTime instanceof Date?f=(0,K.default)(t.endTime):f=(0,K.default)(t.endTime,e,!0);let[y,w]=Ei(r,f,e,n,s);t.endTime=y.toDate(),t.renderEndTime=w},"checkTaskDates"),Ei=l(function(t,e,n,s,r){let f=!1,y=null,w=e.add(1e4,"d");for(;t<=e;){if(f||(y=e.toDate()),f=Ge(t,n,s,r),f&&(e=e.add(1,"d"),e>w))throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");t=t.add(1,"d")}return[e,y]},"fixTaskDates"),qt=l(function(t,e,n){if(n=n.trim(),l(w=>{let C=w.trim();return C==="x"||C==="X"},"isTimestampFormat")(e)&&/^\d+$/.test(n))return new Date(Number(n));let f=/^after\s+(?<ids>[\d\w- ]+)/.exec(n);if(f!==null){let w=null;for(let R of f.groups.ids.split(" ")){let $=lt(R);$!==void 0&&(!w||$.endTime>w.endTime)&&(w=$)}if(w)return w.endTime;let C=new Date;return C.setHours(0,0,0,0),C}let y=(0,K.default)(n,e.trim(),!0);if(y.isValid())return y.toDate();{nt.debug("Invalid date:"+n),nt.debug("With date format:"+e.trim());let w=new Date(n);if(w===void 0||isNaN(w.getTime())||w.getFullYear()<-1e4||w.getFullYear()>1e4)throw new Error("Invalid date:"+n);return w}},"getStartDate"),Ue=l(function(t){let e=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return e!==null?[Number.parseFloat(e[1]),e[2]]:[NaN,"ms"]},"parseDuration"),qe=l(function(t,e,n,s=!1){n=n.trim();let f=/^until\s+(?<ids>[\d\w- ]+)/.exec(n);if(f!==null){let $=null;for(let z of f.groups.ids.split(" ")){let B=lt(z);B!==void 0&&(!$||B.startTime<$.startTime)&&($=B)}if($)return $.startTime;let H=new Date;return H.setHours(0,0,0,0),H}let y=(0,K.default)(n,e.trim(),!0);if(y.isValid())return s&&(y=y.add(1,"d")),y.toDate();let w=(0,K.default)(t),[C,R]=Ue(n);if(!Number.isNaN(C)){let $=w.add(C,R);$.isValid()&&(w=$)}return w.toDate()},"getEndDate"),Dt=0,yt=l(function(t){return t===void 0?(Dt=Dt+1,"task"+Dt):t},"parseId"),Ii=l(function(t,e){let n;e.substr(0,1)===":"?n=e.substr(1,e.length):n=e;let s=n.split(","),r={};ae(s,r,Be);for(let y=0;y<s.length;y++)s[y]=s[y].trim();let f="";switch(s.length){case 1:r.id=yt(),r.startTime=t.endTime,f=s[0];break;case 2:r.id=yt(),r.startTime=qt(void 0,tt,s[0]),f=s[1];break;case 3:r.id=yt(s[0]),r.startTime=qt(void 0,tt,s[1]),f=s[2];break;default:}return f&&(r.endTime=qe(r.startTime,tt,f,bt),r.manualEndTime=(0,K.default)(f,"YYYY-MM-DD",!0).isValid(),Xe(r,tt,pt,gt)),r},"compileData"),Yi=l(function(t,e){let n;e.substr(0,1)===":"?n=e.substr(1,e.length):n=e;let s=n.split(","),r={};ae(s,r,Be);for(let f=0;f<s.length;f++)s[f]=s[f].trim();switch(s.length){case 1:r.id=yt(),r.startTime={type:"prevTaskEnd",id:t},r.endTime={data:s[0]};break;case 2:r.id=yt(),r.startTime={type:"getStartDate",startData:s[0]},r.endTime={data:s[1]};break;case 3:r.id=yt(s[0]),r.startTime={type:"getStartDate",startData:s[1]},r.endTime={data:s[2]};break;default:}return r},"parseData"),Zt,St,X=[],Ze={},$i=l(function(t,e){let n={section:vt,type:vt,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:e},task:t,classes:[]},s=Yi(St,e);n.raw.startTime=s.startTime,n.raw.endTime=s.endTime,n.id=s.id,n.prevTaskId=St,n.active=s.active,n.done=s.done,n.crit=s.crit,n.milestone=s.milestone,n.vert=s.vert,n.vert?n.order=-1:(n.order=Ut,Ut++);let r=X.push(n);St=n.id,Ze[n.id]=r-1},"addTask"),lt=l(function(t){let e=Ze[t];return X[e]},"findTaskById"),Li=l(function(t,e){let n={section:vt,type:vt,description:t,task:t,classes:[]},s=Ii(Zt,e);n.startTime=s.startTime,n.endTime=s.endTime,n.id=s.id,n.active=s.active,n.done=s.done,n.crit=s.crit,n.milestone=s.milestone,n.vert=s.vert,Zt=n,Ct.push(n)},"addTaskOrg"),Ve=l(function(){let t=l(function(n){let s=X[n],r="";switch(X[n].raw.startTime.type){case"prevTaskEnd":{let f=lt(s.prevTaskId);s.startTime=f.endTime;break}case"getStartDate":r=qt(void 0,tt,X[n].raw.startTime.startData),r&&(X[n].startTime=r);break}return X[n].startTime&&(X[n].endTime=qe(X[n].startTime,tt,X[n].raw.endTime.data,bt),X[n].endTime&&(X[n].processed=!0,X[n].manualEndTime=(0,K.default)(X[n].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),Xe(X[n],tt,pt,gt))),X[n].processed},"compileTask"),e=!0;for(let[n,s]of X.entries())t(n),e=e&&s.processed;return e},"compileTasks"),Ai=l(function(t,e){let n=e;ct().securityLevel!=="loose"&&(n=(0,Ne.sanitizeUrl)(e)),t.split(",").forEach(function(s){lt(s)!==void 0&&(Ke(s,()=>{window.open(n,"_self")}),te.set(s,n))}),Qe(t,"clickable")},"setLink"),Qe=l(function(t,e){t.split(",").forEach(function(n){let s=lt(n);s!==void 0&&s.classes.push(e)})},"setClass"),Fi=l(function(t,e,n){if(ct().securityLevel!=="loose"||e===void 0)return;let s=[];if(typeof n=="string"){s=n.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let f=0;f<s.length;f++){let y=s[f].trim();y.startsWith('"')&&y.endsWith('"')&&(y=y.substr(1,y.length-2)),s[f]=y}}s.length===0&&s.push(t),lt(t)!==void 0&&Ke(t,()=>{$e.runFunc(e,...s)})},"setClickFun"),Ke=l(function(t,e){se.push(function(){let n=mt?`${mt}-${t}`:t,s=document.querySelector(`[id="${n}"]`);s!==null&&s.addEventListener("click",function(){e()})},function(){let n=mt?`${mt}-${t}`:t,s=document.querySelector(`[id="${n}-text"]`);s!==null&&s.addEventListener("click",function(){e()})})},"pushFun"),Oi=l(function(t,e,n){t.split(",").forEach(function(s){Fi(s,e,n)}),Qe(t,"clickable")},"setClickEvent"),Wi=l(function(t){se.forEach(function(e){e(t)})},"bindFunctions"),Vi={getConfig:l(()=>ct().gantt,"getConfig"),clear:ii,setDateFormat:ui,getDateFormat:gi,enableInclusiveEndDates:di,endDatesAreInclusive:fi,enableTopAxis:hi,topAxisEnabled:mi,setAxisFormat:ri,getAxisFormat:ni,setTickInterval:ai,getTickInterval:oi,setTodayMarker:ci,getTodayMarker:li,setAccTitle:fe,getAccTitle:he,setDiagramTitle:ye,getDiagramTitle:ge,setDiagramId:si,setDisplayMode:ki,getDisplayMode:yi,setAccDescription:me,getAccDescription:ke,addSection:wi,getSections:_i,getTasks:Di,addTask:$i,findTaskById:lt,addTaskOrg:Li,setIncludes:pi,getIncludes:vi,setExcludes:Ti,getExcludes:bi,setClickEvent:Oi,setLink:Ai,getLinks:xi,bindFunctions:Wi,parseDuration:Ue,isInvalidDate:Ge,setWeekday:Si,getWeekday:Ci,setWeekend:Mi};function ae(t,e,n){let s=!0;for(;s;)s=!1,n.forEach(function(r){let f="^\\s*"+r+"\\s*$",y=new RegExp(f);t[0].match(y)&&(e[r]=!0,t.shift(1),s=!0)})}D(ae,"getTaskTags");l(ae,"getTaskTags");kt.default.extend(Je.default);var Pi=l(function(){nt.debug("Something is calling, setConf, remove the call")},"setConf"),Pe={monday:De,tuesday:Se,wednesday:Ce,thursday:Me,friday:Ee,saturday:Ie,sunday:_e},Ni=l((t,e)=>{let n=[...t].map(()=>-1/0),s=[...t].sort((f,y)=>f.startTime-y.startTime||f.order-y.order),r=0;for(let f of s)for(let y=0;y<n.length;y++)if(f.startTime>=n[y]){n[y]=f.endTime,f.order=y+e,y>r&&(r=y);break}return r},"getMaxIntersections"),rt,Gt=1e4,Ri=l(function(t,e,n,s){let r=ct().gantt;s.db.setDiagramId(e);let f=ct().securityLevel,y;f==="sandbox"&&(y=Tt("#i"+e));let w=f==="sandbox"?Tt(y.nodes()[0].contentDocument.body):Tt("body"),C=f==="sandbox"?y.nodes()[0].contentDocument:document,R=C.getElementById(e);rt=R.parentElement.offsetWidth,rt===void 0&&(rt=1200),r.useWidth!==void 0&&(rt=r.useWidth);let $=s.db.getTasks(),H=$.filter(k=>!k.vert),z=[];for(let k of H)z.push(k.type);z=O(z);let B={},x=2*r.topPadding;if(s.db.getDisplayMode()==="compact"||r.displayMode==="compact"){let k={};for(let v of H)k[v.section]===void 0?k[v.section]=[v]:k[v.section].push(v);let p=0;for(let v of Object.keys(k)){let T=Ni(k[v],p)+1;p+=T,x+=T*(r.barHeight+r.barGap),B[v]=T}}else{x+=H.length*(r.barHeight+r.barGap);for(let k of z)B[k]=H.filter(p=>p.type===k).length}R.setAttribute("viewBox","0 0 "+rt+" "+x);let _=w.select(`[id="${e}"]`),b=Ye().domain([ve($,function(k){return k.startTime}),pe($,function(k){return k.endTime})]).rangeRound([0,rt-r.leftPadding-r.rightPadding]);function F(k,p){let v=k.startTime,T=p.startTime,a=0;return v>T?a=1:v<T&&(a=-1),a}D(F,"taskCompare"),l(F,"taskCompare"),$.sort(F),U($,rt,x),ue(_,x,rt,r.useMaxWidth),_.append("text").text(s.db.getDiagramTitle()).attr("x",rt/2).attr("y",r.titleTopMargin).attr("class","titleText");function U(k,p,v){let T=r.barHeight,a=T+r.barGap,h=r.topPadding,d=r.leftPadding,u=we().domain([0,z.length]).range(["#00B9FA","#F95002"]).interpolate(xe);L(a,h,d,p,v,k,s.db.getExcludes(),s.db.getIncludes()),m(d,h,p,v),q(k,a,h,d,T,u,p,v),Y(a,h,d,T,u),V(d,h,p,v)}D(U,"makeGantt"),l(U,"makeGantt");function q(k,p,v,T,a,h,d){k.sort((o,S)=>o.vert===S.vert?0:o.vert?1:-1);let u=k.filter(o=>!o.vert),i=[...new Set(u.map(o=>o.order))].map(o=>u.find(S=>S.order===o));_.append("g").selectAll("rect").data(i).enter().append("rect").attr("x",0).attr("y",function(o,S){return S=o.order,S*p+v-2}).attr("width",function(){return d-r.rightPadding/2}).attr("height",p).attr("class",function(o){for(let[S,I]of z.entries())if(o.type===I)return"section section"+S%r.numberSectionStyles;return"section section0"}).enter();let E=_.append("g").selectAll("rect").data(k).enter(),c=s.db.getLinks();if(E.append("rect").attr("id",function(o){return e+"-"+o.id}).attr("rx",3).attr("ry",3).attr("x",function(o){return o.milestone?b(o.startTime)+T+.5*(b(o.endTime)-b(o.startTime))-.5*a:b(o.startTime)+T}).attr("y",function(o,S){return S=o.order,o.vert?r.gridLineStartPadding:S*p+v}).attr("width",function(o){return o.milestone?a:o.vert?.08*a:b(o.renderEndTime||o.endTime)-b(o.startTime)}).attr("height",function(o){return o.vert?u.length*(r.barHeight+r.barGap)+r.barHeight*2:a}).attr("transform-origin",function(o,S){return S=o.order,(b(o.startTime)+T+.5*(b(o.endTime)-b(o.startTime))).toString()+"px "+(S*p+v+.5*a).toString()+"px"}).attr("class",function(o){let S="task",I="";o.classes.length>0&&(I=o.classes.join(" "));let P=0;for(let[A,W]of z.entries())o.type===W&&(P=A%r.numberSectionStyles);let N="";return o.active?o.crit?N+=" activeCrit":N=" active":o.done?o.crit?N=" doneCrit":N=" done":o.crit&&(N+=" crit"),N.length===0&&(N=" task"),o.milestone&&(N=" milestone "+N),o.vert&&(N=" vert "+N),N+=P,N+=" "+I,S+N}),E.append("text").attr("id",function(o){return e+"-"+o.id+"-text"}).text(function(o){return o.task}).attr("font-size",r.fontSize).attr("x",function(o){let S=b(o.startTime),I=b(o.renderEndTime||o.endTime);if(o.milestone&&(S+=.5*(b(o.endTime)-b(o.startTime))-.5*a,I=S+a),o.vert)return b(o.startTime)+T;let P=this.getBBox().width;return P>I-S?I+P+1.5*r.leftPadding>d?S+T-5:I+T+5:(I-S)/2+S+T}).attr("y",function(o,S){return o.vert?r.gridLineStartPadding+u.length*(r.barHeight+r.barGap)+60:(S=o.order,S*p+r.barHeight/2+(r.fontSize/2-2)+v)}).attr("text-height",a).attr("class",function(o){let S=b(o.startTime),I=b(o.endTime);o.milestone&&(I=S+a);let P=this.getBBox().width,N="";o.classes.length>0&&(N=o.classes.join(" "));let A=0;for(let[et,it]of z.entries())o.type===it&&(A=et%r.numberSectionStyles);let W="";return o.active&&(o.crit?W="activeCritText"+A:W="activeText"+A),o.done?o.crit?W=W+" doneCritText"+A:W=W+" doneText"+A:o.crit&&(W=W+" critText"+A),o.milestone&&(W+=" milestoneText"),o.vert&&(W+=" vertText"),P>I-S?I+P+1.5*r.leftPadding>d?N+" taskTextOutsideLeft taskTextOutside"+A+" "+W:N+" taskTextOutsideRight taskTextOutside"+A+" "+W+" width-"+P:N+" taskText taskText"+A+" "+W+" width-"+P}),ct().securityLevel==="sandbox"){let o;o=Tt("#i"+e);let S=o.nodes()[0].contentDocument;E.filter(function(I){return c.has(I.id)}).each(function(I){var P=S.querySelector("#"+CSS.escape(e+"-"+I.id)),N=S.querySelector("#"+CSS.escape(e+"-"+I.id+"-text"));let A=P.parentNode;var W=S.createElement("a");W.setAttribute("xlink:href",c.get(I.id)),W.setAttribute("target","_top"),A.appendChild(W),W.appendChild(P),W.appendChild(N)})}}D(q,"drawRects"),l(q,"drawRects");function L(k,p,v,T,a,h,d,u){if(d.length===0&&u.length===0)return;let M,i;for(let{startTime:I,endTime:P}of h)(M===void 0||I<M)&&(M=I),(i===void 0||P>i)&&(i=P);if(!M||!i)return;if((0,kt.default)(i).diff((0,kt.default)(M),"year")>5){nt.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}let E=s.db.getDateFormat(),c=[],j=null,o=(0,kt.default)(M);for(;o.valueOf()<=i;)s.db.isInvalidDate(o,E,d,u)?j?j.end=o:j={start:o,end:o}:j&&(c.push(j),j=null),o=o.add(1,"d");_.append("g").selectAll("rect").data(c).enter().append("rect").attr("id",I=>e+"-exclude-"+I.start.format("YYYY-MM-DD")).attr("x",I=>b(I.start.startOf("day"))+v).attr("y",r.gridLineStartPadding).attr("width",I=>b(I.end.endOf("day"))-b(I.start.startOf("day"))).attr("height",a-p-r.gridLineStartPadding).attr("transform-origin",function(I,P){return(b(I.start)+v+.5*(b(I.end)-b(I.start))).toString()+"px "+(P*k+.5*a).toString()+"px"}).attr("class","exclude-range")}D(L,"drawExcludeDays"),l(L,"drawExcludeDays");function g(k,p,v,T){if(v<=0||k>p)return 1/0;let a=p-k,h=kt.default.duration({[T??"day"]:v}).asMilliseconds();return h<=0?1/0:Math.ceil(a/h)}D(g,"getEstimatedTickCount"),l(g,"getEstimatedTickCount");function m(k,p,v,T){let a=s.db.getDateFormat(),h=s.db.getAxisFormat(),d;h?d=h:a==="D"?d="%d":d=r.axisFormat??"%Y-%m-%d";let u=be(b).tickSize(-T+p+r.gridLineStartPadding).tickFormat(Wt(d)),i=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(s.db.getTickInterval()||r.tickInterval);if(i!==null){let E=parseInt(i[1],10);if(isNaN(E)||E<=0)nt.warn(`Invalid tick interval value: "${i[1]}". Skipping custom tick interval.`);else{let c=i[2],j=s.db.getWeekday()||r.weekday,o=b.domain(),S=o[0],I=o[1],P=g(S,I,E,c);if(P>Gt)nt.warn(`The tick interval "${E}${c}" would generate ${P} ticks, which exceeds the maximum allowed (${Gt}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(c){case"millisecond":u.ticks(Yt.every(E));break;case"second":u.ticks($t.every(E));break;case"minute":u.ticks(Lt.every(E));break;case"hour":u.ticks(At.every(E));break;case"day":u.ticks(Ft.every(E));break;case"week":u.ticks(Pe[j].every(E));break;case"month":u.ticks(Ot.every(E));break}}}if(_.append("g").attr("class","grid").attr("transform","translate("+k+", "+(T-50)+")").call(u).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),s.db.topAxisEnabled()||r.topAxis){let E=Te(b).tickSize(-T+p+r.gridLineStartPadding).tickFormat(Wt(d));if(i!==null){let c=parseInt(i[1],10);if(isNaN(c)||c<=0)nt.warn(`Invalid tick interval value: "${i[1]}". Skipping custom tick interval.`);else{let j=i[2],o=s.db.getWeekday()||r.weekday,S=b.domain(),I=S[0],P=S[1];if(g(I,P,c,j)<=Gt)switch(j){case"millisecond":E.ticks(Yt.every(c));break;case"second":E.ticks($t.every(c));break;case"minute":E.ticks(Lt.every(c));break;case"hour":E.ticks(At.every(c));break;case"day":E.ticks(Ft.every(c));break;case"week":E.ticks(Pe[o].every(c));break;case"month":E.ticks(Ot.every(c));break}}}_.append("g").attr("class","grid").attr("transform","translate("+k+", "+p+")").call(E).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}D(m,"makeGrid"),l(m,"makeGrid");function Y(k,p){let v=0,T=Object.keys(B).map(a=>[a,B[a]]);_.append("g").selectAll("text").data(T).enter().append(function(a){let h=a[0].split(le.lineBreakRegex),d=-(h.length-1)/2,u=C.createElementNS("http://www.w3.org/2000/svg","text");u.setAttribute("dy",d+"em");for(let[M,i]of h.entries()){let E=C.createElementNS("http://www.w3.org/2000/svg","tspan");E.setAttribute("alignment-baseline","central"),E.setAttribute("x","10"),M>0&&E.setAttribute("dy","1em"),E.textContent=i,u.appendChild(E)}return u}).attr("x",10).attr("y",function(a,h){if(h>0)for(let d=0;d<h;d++)return v+=T[h-1][1],a[1]*k/2+v*k+p;else return a[1]*k/2+p}).attr("font-size",r.sectionFontSize).attr("class",function(a){for(let[h,d]of z.entries())if(a[0]===d)return"sectionTitle sectionTitle"+h%r.numberSectionStyles;return"sectionTitle"})}D(Y,"vertLabels"),l(Y,"vertLabels");function V(k,p,v,T){let a=s.db.getTodayMarker();if(a==="off")return;let h=_.append("g").attr("class","today"),d=new Date,u=h.append("line");u.attr("x1",b(d)+k).attr("x2",b(d)+k).attr("y1",r.titleTopMargin).attr("y2",T-r.titleTopMargin).attr("class","today"),a!==""&&u.attr("style",a.replace(/,/g,";"))}D(V,"drawToday"),l(V,"drawToday");function O(k){let p={},v=[];for(let T=0,a=k.length;T<a;++T)Object.prototype.hasOwnProperty.call(p,k[T])||(p[k[T]]=!0,v.push(k[T]));return v}D(O,"checkUnique"),l(O,"checkUnique")},"draw"),zi={setConf:Pi,draw:Ri},Hi=l(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar \u2014 same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,"getStyles"),Bi=Hi,ts={parser:ei,db:Vi,renderer:zi,styles:Bi};export{ts as diagram};
